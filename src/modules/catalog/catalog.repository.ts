import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

export async function fetchCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    logger.error({ supabaseError: error }, 'fetchCategories failed');
    throw new AppError(500, `Failed to fetch categories: ${error.message}`, 'CATEGORY_QUERY_FAILED');
  }

  return data;
}

export async function fetchFinishTypes() {
  const { data, error } = await supabaseAdmin
    .from('finish_types')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    logger.error({ supabaseError: error }, 'fetchFinishTypes failed');
    throw new AppError(500, `Failed to fetch finish types: ${error.message}`, 'FINISH_TYPE_QUERY_FAILED');
  }

  return data;
}

export async function fetchOccasionTypes() {
  const { data, error } = await supabaseAdmin
    .from('occasion_types')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    logger.error({ supabaseError: error }, 'fetchOccasionTypes failed');
    throw new AppError(500, `Failed to fetch occasion types: ${error.message}`, 'OCCASION_TYPE_QUERY_FAILED');
  }

  return data;
}
