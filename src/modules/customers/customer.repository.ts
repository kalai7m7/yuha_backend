import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone_number: string;
  alternate_phone: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  status: 'new' | 'active' | 'vip';
  created_at: string;
}

export interface FindOrCreateCustomerInput {
  name: string;
  email?: string;
  phone_number: string;
  alternate_phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export async function findOrCreateCustomer(input: FindOrCreateCustomerInput): Promise<CustomerRow> {
  // Check if customer exists by phone_number
  const { data: existing, error: findError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('phone_number', input.phone_number)
    .maybeSingle();

  if (findError) {
    logger.error({ error: findError }, 'Error looking up customer');
  }

  if (existing) {
    // Update name/email/address fields if they are now available
    const updates: Record<string, any> = {};
    if (input.email && !existing.email) updates.email = input.email;
    if (input.name) updates.name = input.name;
    if (input.address_line && !existing.address_line) updates.address_line = input.address_line;
    if (input.city && !existing.city) updates.city = input.city;
    if (input.state && !existing.state) updates.state = input.state;
    if (input.pincode && !existing.pincode) updates.pincode = input.pincode;

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from('customers')
        .update(updates)
        .eq('id', existing.id);
    }
    return existing;
  }

  // Create new customer
  const { data: created, error: createError } = await supabaseAdmin
    .from('customers')
    .insert({
      name: input.name,
      email: input.email || null,
      phone_number: input.phone_number,
      alternate_phone: input.alternate_phone || null,
      address_line: input.address_line || null,
      city: input.city || null,
      state: input.state || null,
      pincode: input.pincode || null,
      status: 'new',
    })
    .select('*')
    .single();

  if (createError || !created) {
    logger.error({ error: createError }, 'Failed to create customer');
    throw new AppError(500, `Failed to create customer: ${createError?.message}`, 'CUSTOMER_CREATE_FAILED');
  }

  return created;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listCustomers(opts: PaginationOptions = {}): Promise<PaginatedResult<any>> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('customers')
    .select(`*, orders(id, grand_total, status, order_date)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    logger.error({ error }, 'Failed to list customers');
    throw new AppError(500, `Failed to list customers: ${error.message}`, 'CUSTOMER_QUERY_FAILED');
  }

  const total = count ?? 0;
  return {
    data: data ?? [],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select(`
      *,
      orders(*),
      customer_addresses(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
  }

  return data;
}
