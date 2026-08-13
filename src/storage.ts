// src/storage.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Upload a Multer memory-buffer file to Supabase Storage bucket "products".
 * Returns the public CDN URL of the uploaded file.
 */
export async function uploadImageToStorage(
  file: Express.Multer.File,
  productId: number,
  index: number,
): Promise<string> {
  const safeName = file.originalname.replace(/\s+/g, '_');
  const storagePath = `products/${productId}/${Date.now()}-${index}-${safeName}`;

  const { error } = await supabase.storage
    .from('products')
    .upload(storagePath, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from('products').getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Delete files from Supabase Storage bucket "products".
 * Accepts an array of full public CDN URLs and extracts the storage path from each.
 */
export async function deleteImagesFromStorage(imageUrls: string[]): Promise<void> {
  const paths = imageUrls
    .map(url => {
      try {
        // Extract path after "/object/public/products/"
        const match = url.match(/\/object\/public\/products\/(.+)$/);
        return match ? match[1] : null;
      } catch {
        return null;
      }
    })
    .filter((p): p is string => p !== null);

  if (!paths.length) return;

  const { error } = await supabase.storage.from('products').remove(paths);
  if (error) {
    // Log but don't throw — a Storage cleanup failure should not block the DB delete response
    console.warn(`[Storage] Failed to remove files: ${error.message}`);
  }
}
