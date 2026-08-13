import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

const PRODUCT_SELECT = `
  id, name, description, price, stock_quantity, is_active, created_at, updated_at,
  categories(id, name),
  finish_types(id, name),
  occasion_types(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

export interface ProductFilters {
  category?: string;
  finish_type?: string;
  occasion_type?: string;
  is_available?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'newest';
}

export async function listProducts(filters: ProductFilters = {}) {
  let query = supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT);

  if (filters.is_available !== undefined) {
    query = query.eq('is_active', filters.is_available);
  }

  if (filters.category) {
    query = query.eq('categories.name', filters.category);
  }

  if (filters.finish_type) {
    query = query.eq('finish_types.name', filters.finish_type);
  }

  if (filters.occasion_type) {
    query = query.eq('occasion_types.name', filters.occasion_type);
  }

  switch (filters.sort_by) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    logger.error({ supabaseError: error }, 'listProducts failed');
    throw new AppError(500, `Failed to fetch products: ${error.message}`, 'PRODUCT_QUERY_FAILED');
  }

  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    logger.error({ supabaseError: error }, 'getProductById failed');
    throw new AppError(500, `Failed to fetch product: ${error.message}`, 'PRODUCT_QUERY_FAILED');
  }

  if (!data) {
    throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  return data;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  category_id?: string;
  finish_type_id?: string;
  occasion_type_id?: string;
}

export async function createProduct(input: CreateProductInput) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      stock_quantity: input.stock_quantity ?? 0,
      category_id: input.category_id ?? null,
      finish_type_id: input.finish_type_id ?? null,
      occasion_type_id: input.occasion_type_id ?? null,
      is_active: true
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    logger.error({ supabaseError: error }, 'createProduct failed');
    throw new AppError(500, `Failed to create product: ${error.message}`, 'PRODUCT_CREATE_FAILED');
  }

  return data;
}

export type UpdateProductInput = Partial<CreateProductInput> & { is_active?: boolean };

export async function updateProduct(id: string, input: UpdateProductInput) {
  // Confirm the product exists first so we return 404 instead of a silent no-op
  await getProductById(id);

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(input)
    .eq('id', id)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    logger.error({ supabaseError: error }, 'updateProduct failed');
    throw new AppError(500, `Failed to update product: ${error.message}`, 'PRODUCT_UPDATE_FAILED');
  }

  return data;
}

export async function deleteProduct(id: string) {
  // Confirm the product exists first
  await getProductById(id);

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error({ supabaseError: error }, 'deleteProduct failed');
    throw new AppError(500, `Failed to delete product: ${error.message}`, 'PRODUCT_DELETE_FAILED');
  }
}
