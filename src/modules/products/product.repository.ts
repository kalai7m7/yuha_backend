import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';

export async function listProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      categories(id, name),
      finish_types(id, name),
      occasion_types(id, name),
      product_images(id, image_url, is_primary, sort_order)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, 'Failed to fetch products', 'PRODUCT_QUERY_FAILED');
  }

  return data;
}
