import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';

const BUCKET = 'products';

/**
 * Upload image files to Supabase Storage and insert rows into product_images.
 * Stores the full public CDN URL in image_url so the frontend can render
 * them directly without any prefix (VITE_IMAGE_URL = "").
 */
export async function uploadProductImages(
  productId: string,
  files: Express.Multer.File[]
) {
  // Determine current max sort_order for this product
  const { data: existing } = await supabaseAdmin
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const baseOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const isFirstBatch = baseOrder === 0;

  const insertRows: {
    product_id: string;
    image_url: string;
    image_path: string;
    is_primary: boolean;
    sort_order: number;
  }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const storagePath = `${productId}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      logger.error({ uploadError, storagePath }, 'Storage upload failed');
      throw new AppError(500, `Failed to upload image: ${uploadError.message}`, 'IMAGE_UPLOAD_FAILED');
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    insertRows.push({
      product_id: productId,
      image_url: urlData.publicUrl,   // full CDN URL — stored directly
      image_path: storagePath,        // kept for deletion
      is_primary: isFirstBatch && i === 0,
      sort_order: baseOrder + i,
    });
  }

  const { data, error: insertError } = await supabaseAdmin
    .from('product_images')
    .insert(insertRows)
    .select('id, image_url, image_path, is_primary, sort_order');

  if (insertError) {
    logger.error({ insertError }, 'product_images insert failed');
    throw new AppError(500, `Failed to save image records: ${insertError.message}`, 'IMAGE_INSERT_FAILED');
  }

  return data;
}

/**
 * Delete image records and their corresponding Storage objects.
 */
export async function deleteProductImages(imageIds: string[]) {
  const { data: rows, error: fetchError } = await supabaseAdmin
    .from('product_images')
    .select('id, image_path')
    .in('id', imageIds);

  if (fetchError) {
    throw new AppError(500, `Failed to fetch images for deletion: ${fetchError.message}`, 'IMAGE_FETCH_FAILED');
  }

  if (!rows || rows.length === 0) return;

  const paths = rows.map((r) => r.image_path).filter(Boolean);

  if (paths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) {
      logger.warn({ storageError, paths }, 'Storage removal partial failure — continuing with DB delete');
    }
  }

  const { error: deleteError } = await supabaseAdmin
    .from('product_images')
    .delete()
    .in('id', imageIds);

  if (deleteError) {
    throw new AppError(500, `Failed to delete image records: ${deleteError.message}`, 'IMAGE_DELETE_FAILED');
  }
}
