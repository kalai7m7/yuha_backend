import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

export interface DeliveryPincode {
  pincode: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
}

export async function checkPincode(pincode: string) {
  const { data, error } = await supabaseAdmin
    .from('delivery_pincodes')
    .select('pincode, city, state, is_active')
    .eq('pincode', pincode)
    .maybeSingle();

  if (error) {
    logger.error({ error, pincode }, 'Failed to query pincode');
    throw new AppError(500, `Failed to check pincode: ${error.message}`, 'PINCODE_QUERY_FAILED');
  }

  if (!data || !data.is_active) {
    return {
      pincode,
      deliverable: false,
      city: data?.city ?? null,
      state: data?.state ?? null,
    };
  }

  return {
    pincode: data.pincode,
    deliverable: true,
    city: data.city,
    state: data.state,
  };
}

export async function listAllPincodes() {
  const { data, error } = await supabaseAdmin
    .from('delivery_pincodes')
    .select('pincode, city, state, is_active')
    .order('pincode', { ascending: true });

  if (error) {
    logger.error({ error }, 'Failed to list pincodes');
    throw new AppError(500, `Failed to list pincodes: ${error.message}`, 'PINCODE_QUERY_FAILED');
  }

  return data ?? [];
}
