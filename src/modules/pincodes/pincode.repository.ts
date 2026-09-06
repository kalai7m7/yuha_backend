import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DeliveryPincode {
  pincode: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
  source: 'admin' | 'cache';
  cached_at: string | null;
  created_at: string;
}

export type PincodeSource = 'admin' | 'cache' | 'external' | 'fallback';

export interface PincodeResult {
  pincode: string;
  deliverable: boolean;
  city: string | null;
  state: string | null;
  source: PincodeSource;
  warning?: string;
}

// ── External API types ───────────────────────────────────────────────────────

interface PostalOffice {
  Name: string;
  District: string;
  State: string;
  DeliveryStatus: string;
}

interface PostalApiResponse {
  Status: string;
  PostOffice: PostalOffice[] | null;
}

// ── Layer 2: External API lookup ─────────────────────────────────────────────

async function fetchFromPostalApi(pincode: string): Promise<{ city: string; state: string } | null> {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) return null;

    const json = (await response.json()) as PostalApiResponse[];
    const entry = json?.[0];

    if (!entry || entry.Status !== 'Success' || !entry.PostOffice?.length) {
      return null;
    }

    // Prefer an office with delivery capability if available
    const office =
      entry.PostOffice.find((o) => o.DeliveryStatus === 'Delivery') ??
      entry.PostOffice[0];

    return {
      city: office.District,
      state: office.State,
    };
  } catch (err) {
    logger.warn({ err, pincode }, 'External pincode API call failed');
    return null;
  }
}

// ── Layer 2 cache write ───────────────────────────────────────────────────────

async function cacheToDb(pincode: string, city: string, state: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('delivery_pincodes')
    .upsert(
      { pincode, city, state, is_active: true, source: 'cache', cached_at: new Date().toISOString() },
      { onConflict: 'pincode', ignoreDuplicates: false }
    );

  if (error) {
    // Non-fatal: log and continue — cache miss is acceptable
    logger.warn({ error, pincode }, 'Failed to cache pincode result to DB');
  }
}

// ── Main export: 3-layer lookup ───────────────────────────────────────────────

export async function checkPincode(pincode: string): Promise<PincodeResult> {
  // ── Layer 1: Supabase DB (admin list + cache) ────────────────────────────
  const { data, error: dbError } = await supabaseAdmin
    .from('delivery_pincodes')
    .select('pincode, city, state, is_active, source')
    .eq('pincode', pincode)
    .maybeSingle();

  if (dbError) {
    logger.error({ dbError, pincode }, 'DB pincode query failed — falling through to external API');
    // Do not throw — continue to Layer 2
  } else if (data) {
    if (!data.is_active) {
      // Admin-blocked pincode — hard stop, skip external API
      return { pincode, deliverable: false, city: data.city, state: data.state, source: data.source };
    }
    // Found and active — return immediately
    return { pincode, deliverable: true, city: data.city, state: data.state, source: data.source };
  }

  // ── Layer 2: External postal API ────────────────────────────────────────
  const external = await fetchFromPostalApi(pincode);

  if (external) {
    // Write back to DB as cache entry (fire-and-forget — don't await to block response)
    cacheToDb(pincode, external.city, external.state).catch(() => {});

    return {
      pincode,
      deliverable: true,
      city: external.city,
      state: external.state,
      source: 'external',
    };
  }

  // ── Layer 3: Fallback — unknown pincode ──────────────────────────────────
  logger.warn({ pincode }, 'Pincode not found in DB or external API — returning fallback');

  return {
    pincode,
    deliverable: true,
    city: null,
    state: null,
    source: 'fallback',
    warning:
      `Pincode ${pincode} could not be verified. If your address is correct, ` +
      `you can still proceed — our team will confirm delivery before dispatch.`,
  };
}

// ── List all admin/cached pincodes ────────────────────────────────────────────

export async function listAllPincodes(): Promise<DeliveryPincode[]> {
  const { data, error } = await supabaseAdmin
    .from('delivery_pincodes')
    .select('pincode, city, state, is_active, source, cached_at, created_at')
    .order('pincode', { ascending: true });

  if (error) {
    logger.error({ error }, 'Failed to list pincodes');
    throw new AppError(500, `Failed to list pincodes: ${error.message}`, 'PINCODE_QUERY_FAILED');
  }

  return (data ?? []) as DeliveryPincode[];
}
