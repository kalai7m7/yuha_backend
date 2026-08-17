import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone_number: string;
  alternate_phone: string | null;
  status: 'new' | 'active' | 'vip';
  created_at: string;
}

export interface FindOrCreateCustomerInput {
  name: string;
  email?: string;
  phone_number: string;
  alternate_phone?: string;
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
    // Optionally update name/email if provided
    if (input.email && !existing.email) {
      await supabaseAdmin
        .from('customers')
        .update({ email: input.email, name: input.name })
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

export async function listCustomers() {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select(`
      *,
      orders(id, grand_total, status, order_date)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error({ error }, 'Failed to list customers');
    throw new AppError(500, `Failed to list customers: ${error.message}`, 'CUSTOMER_QUERY_FAILED');
  }

  return data ?? [];
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
