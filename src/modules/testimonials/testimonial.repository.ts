import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

const TESTIMONIAL_SELECT = 'id, name, city, product, review, initials, avatar_class, is_active, sort_order, created_at, updated_at';

export interface CreateTestimonialInput {
  name: string;
  city: string;
  product: string;
  review: string;
  initials: string;
  avatar_class?: string;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;

export async function listTestimonials(activeOnly = false) {
  let query = supabaseAdmin
    .from('testimonials')
    .select(TESTIMONIAL_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    logger.error({ supabaseError: error }, 'listTestimonials failed');
    throw new AppError(500, `Failed to fetch testimonials: ${error.message}`, 'TESTIMONIAL_QUERY_FAILED');
  }

  return data ?? [];
}

export async function getTestimonialById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select(TESTIMONIAL_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(404, 'Testimonial not found', 'TESTIMONIAL_NOT_FOUND');
    }
    logger.error({ supabaseError: error }, 'getTestimonialById failed');
    throw new AppError(500, `Failed to fetch testimonial: ${error.message}`, 'TESTIMONIAL_QUERY_FAILED');
  }

  return data;
}

export async function createTestimonial(input: CreateTestimonialInput) {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({
      name: input.name,
      city: input.city,
      product: input.product,
      review: input.review,
      initials: input.initials,
      avatar_class: input.avatar_class ?? 'bg-mint text-teal-900',
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select(TESTIMONIAL_SELECT)
    .single();

  if (error) {
    logger.error({ supabaseError: error }, 'createTestimonial failed');
    throw new AppError(500, `Failed to create testimonial: ${error.message}`, 'TESTIMONIAL_CREATE_FAILED');
  }

  return data;
}

export async function updateTestimonial(id: string, input: UpdateTestimonialInput) {
  await getTestimonialById(id);

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(TESTIMONIAL_SELECT)
    .single();

  if (error) {
    logger.error({ supabaseError: error }, 'updateTestimonial failed');
    throw new AppError(500, `Failed to update testimonial: ${error.message}`, 'TESTIMONIAL_UPDATE_FAILED');
  }

  return data;
}

export async function deleteTestimonial(id: string) {
  await getTestimonialById(id);

  const { error } = await supabaseAdmin
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error({ supabaseError: error }, 'deleteTestimonial failed');
    throw new AppError(500, `Failed to delete testimonial: ${error.message}`, 'TESTIMONIAL_DELETE_FAILED');
  }
}
