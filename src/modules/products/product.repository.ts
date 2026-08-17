import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

// Standard select (no filters on joined tables)
const PRODUCT_SELECT = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories(id, name),
  finish_types(id, name),
  occasion_types(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

// !inner select variants — forces an INNER JOIN on the joined table so
// .eq('table.name', value) acts as a WHERE filter on products rows,
// not just a row filter on the embedded relation.
// One variant per active-filter combination.
const PRODUCT_SELECT_WITH_CATEGORY = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories!inner(id, name),
  finish_types(id, name),
  occasion_types(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_FINISH = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories(id, name),
  finish_types!inner(id, name),
  occasion_types(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_OCCASION = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories(id, name),
  finish_types(id, name),
  occasion_types!inner(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_CATEGORY_AND_FINISH = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories!inner(id, name),
  finish_types!inner(id, name),
  occasion_types(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_CATEGORY_AND_OCCASION = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories!inner(id, name),
  finish_types(id, name),
  occasion_types!inner(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_FINISH_AND_OCCASION = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories(id, name),
  finish_types!inner(id, name),
  occasion_types!inner(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

const PRODUCT_SELECT_WITH_ALL = `
  id, name, description, short_description, price, offer_price, offer_label,
  stock_quantity, delivery_time, is_active, created_at, updated_at,
  categories!inner(id, name),
  finish_types!inner(id, name),
  occasion_types!inner(id, name),
  product_images(id, image_url, is_primary, sort_order)
`;

export interface ProductFilters {
  // Accept comma-separated string (from query param) or array of names.
  // Multiple values perform an OR match (any of the selected values).
  category?: string | string[];
  finish_type?: string | string[];
  occasion_type?: string | string[];
  is_available?: boolean;
  has_offer?: boolean;
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest';
  price_min?: number;
  price_max?: number;
  limit?: number;
  offset?: number;
}

/**
 * Normalise a filter value into a string array.
 * The frontend joins multiple values with "+" (URL-encoded as %2B).
 * Express decodes %2B back to a literal "+", so we split on "+".
 */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value.split('+').filter(Boolean);
}

/**
 * Apply the shared WHERE predicates to any query builder.
 * Used for both the count query and the data query so filters stay in sync.
 */
function applyFilters<T extends ReturnType<typeof supabaseAdmin.from>>(
  query: any,
  filters: ProductFilters,
  categories: string[],
  finishTypes: string[],
  occasionTypes: string[]
): any {
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.is_available !== undefined) {
    query = query.eq('is_active', filters.is_available);
  }
  if (filters.has_offer) {
    query = query.not('offer_price', 'is', null);
  }
  if (filters.price_min !== undefined) {
    query = query.gte('price', filters.price_min);
  }
  if (filters.price_max !== undefined) {
    query = query.lte('price', filters.price_max);
  }
  if (categories.length > 0) {
    query = query.in('categories.name', categories);
  }
  if (finishTypes.length > 0) {
    query = query.in('finish_types.name', finishTypes);
  }
  if (occasionTypes.length > 0) {
    query = query.in('occasion_types.name', occasionTypes);
  }
  return query;
}

export async function listProducts(filters: ProductFilters = {}) {
  const categories = toArray(filters.category);
  const finishTypes = toArray(filters.finish_type);
  const occasionTypes = toArray(filters.occasion_type);

  const hasCategory = categories.length > 0;
  const hasFinish = finishTypes.length > 0;
  const hasOccasion = occasionTypes.length > 0;

  // ── Count query ───────────────────────────────────────────────
  // Uses a minimal select with !inner joins (no product_images) so
  // count: 'exact' counts product rows, not joined image rows.
  let countSelectString = 'id';
  if (hasCategory && hasFinish && hasOccasion) countSelectString = 'id, categories!inner(id), finish_types!inner(id), occasion_types!inner(id)';
  else if (hasCategory && hasFinish)           countSelectString = 'id, categories!inner(id), finish_types!inner(id)';
  else if (hasCategory && hasOccasion)         countSelectString = 'id, categories!inner(id), occasion_types!inner(id)';
  else if (hasFinish && hasOccasion)           countSelectString = 'id, finish_types!inner(id), occasion_types!inner(id)';
  else if (hasCategory)                        countSelectString = 'id, categories!inner(id)';
  else if (hasFinish)                          countSelectString = 'id, finish_types!inner(id)';
  else if (hasOccasion)                        countSelectString = 'id, occasion_types!inner(id)';

  let countQuery = supabaseAdmin.from('products').select(countSelectString, { count: 'exact', head: true });
  countQuery = applyFilters(countQuery, filters, categories, finishTypes, occasionTypes);
  const { count, error: countError } = await countQuery;

  if (countError) {
    logger.error({ supabaseError: countError }, 'listProducts count failed');
    throw new AppError(500, `Failed to count products: ${countError.message}`, 'PRODUCT_QUERY_FAILED');
  }

  // ── Data query ────────────────────────────────────────────────
  // Pick the correct !inner select string for the data fetch.
  let selectString = PRODUCT_SELECT;
  if (hasCategory && hasFinish && hasOccasion) selectString = PRODUCT_SELECT_WITH_ALL;
  else if (hasCategory && hasFinish) selectString = PRODUCT_SELECT_WITH_CATEGORY_AND_FINISH;
  else if (hasCategory && hasOccasion) selectString = PRODUCT_SELECT_WITH_CATEGORY_AND_OCCASION;
  else if (hasFinish && hasOccasion) selectString = PRODUCT_SELECT_WITH_FINISH_AND_OCCASION;
  else if (hasCategory) selectString = PRODUCT_SELECT_WITH_CATEGORY;
  else if (hasFinish) selectString = PRODUCT_SELECT_WITH_FINISH;
  else if (hasOccasion) selectString = PRODUCT_SELECT_WITH_OCCASION;

  let dataQuery = supabaseAdmin.from('products').select(selectString);
  dataQuery = applyFilters(dataQuery, filters, categories, finishTypes, occasionTypes);

  switch (filters.sort_by) {
    case 'price_asc':
      dataQuery = dataQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      dataQuery = dataQuery.order('price', { ascending: false });
      break;
    default:
      dataQuery = dataQuery.order('created_at', { ascending: false });
  }

  // Paginate by product rows (limit/offset on the products table itself).
  const limit = filters.limit ?? 12;
  const offset = filters.offset ?? 0;
  dataQuery = dataQuery.range(offset, offset + limit - 1);

  const { data, error } = await dataQuery;

  if (error) {
    logger.error({ supabaseError: error }, 'listProducts failed');
    throw new AppError(500, `Failed to fetch products: ${error.message}`, 'PRODUCT_QUERY_FAILED');
  }

  return { data: data ?? [], total: count ?? 0 };
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
  short_description?: string;
  price: number;
  offer_price?: number | null;
  offer_label?: string | null;
  stock_quantity?: number;
  delivery_time?: string;
  category_id?: string | null;
  finish_type_id?: string | null;
  occasion_type_id?: string | null;
}

export async function createProduct(input: CreateProductInput) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: input.name,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      price: input.price,
      offer_price: input.offer_price ?? null,
      offer_label: input.offer_label ?? null,
      stock_quantity: input.stock_quantity ?? 0,
      delivery_time: input.delivery_time ?? null,
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
