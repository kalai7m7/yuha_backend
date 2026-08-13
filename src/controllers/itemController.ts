import { Request, Response, NextFunction, RequestHandler } from 'express';
import { db } from '../db';
import { Product, ProductInput } from '../models/products';
import format from 'pg-format';
import logger, { getLoggerWithTrace } from '../logger';
import { toNullableNumber } from '../helper/utils';
import { uploadImageToStorage, deleteImagesFromStorage } from '../storage';

// ─── Create a product ────────────────────────────────────────────────────────
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const client = await db.connect();
  await client.query('BEGIN');

  try {
    const reqWithFiles = req as Request & { files?: Express.Multer.File[] };
    const product: ProductInput = reqWithFiles.body as ProductInput;

    // 1️⃣ Insert product — RETURNING gives us the new PK
    const insertResult = await client.query<{ product_id: number }>(
      `INSERT INTO products
        (p_name, description, short_description, price, offer_price, offer_label,
         finish_type_id, delivery_time, count, category_id, occasion_type_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING product_id`,
      [
        product.p_name,
        product.description || null,
        product.short_description || null,
        product.price,
        toNullableNumber(product.offer_price),
        product.offer_label || null,
        product.finish_type_id || null,
        product.delivery_time || null,
        toNullableNumber(product.count) ?? 0,
        product.category_id || null,
        product.occasion_type_id || null,
      ],
    );

    const insertedId = insertResult.rows[0].product_id;
    logger.info(`[CREATE] ✅ Product created: PID=${insertedId}`);

    // 2️⃣ Upload images to Supabase Storage and insert rows
    if (reqWithFiles.files && reqWithFiles.files.length > 0) {
      logger.info(`[CREATE-IMG] Uploading ${reqWithFiles.files.length} images for PID ${insertedId}`);

      const imageRows: [number, string, string, number][] = [];
      for (const [index, file] of reqWithFiles.files.entries()) {
        const publicUrl = await uploadImageToStorage(file, insertedId, index);
        imageRows.push([insertedId, publicUrl, file.originalname, index + 1]);
      }

      await client.query(
        format(
          'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES %L',
          imageRows,
        ),
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Product created', product_id: insertedId, ...product });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`❌ [CREATE] Error creating product: ${error instanceof Error ? error.message : error}`);
    next(error);
  } finally {
    client.release();
  }
};

// ─── Get single product by ID ─────────────────────────────────────────────────
export const getItemById: RequestHandler = async (req, res, next) => {
  const client = await db.connect();

  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      logger.error(`❌ [READ-ID] Invalid product ID: ${req.params.productId}`);
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const productResult = await client.query(
      `SELECT
         p.product_id,
         p.p_name,
         p.description,
         p.short_description,
         p.price,
         p.offer_price,
         p.offer_label,
         f.name AS finish_type,
         p.delivery_time,
         p.count,
         c.name AS category,
         o.name AS occasion_type,
         p.created_at
       FROM products p
       JOIN categories c      ON p.category_id       = c.category_id
       JOIN finish_types f    ON p.finish_type_id     = f.finish_type_id
       JOIN occasion_types o  ON p.occasion_type_id   = o.occasion_type_id
       WHERE p.product_id = $1`,
      [productId],
    );

    if (productResult.rows.length === 0) {
      logger.error(`❌ [READ-ID] Product ${productId} not found.`);
      res.status(404).json({ error: `Product ${productId} not found.` });
      return;
    }

    const imageResult = await client.query(
      `SELECT image_url, alt_text
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order ASC`,
      [productId],
    );

    res.status(200).json({
      ...productResult.rows[0],
      images: imageResult.rows,
    });
  } catch (error) {
    logger.error(`❌ [READ-ID] Error fetching product: ${error instanceof Error ? error.message : error}`);
    next(error);
  } finally {
    client.release();
  }
};

// ─── Update a product ─────────────────────────────────────────────────────────
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const productId = Number(req.params.productId);
    if (!productId) {
      res.status(400).json({ message: 'Invalid product id' });
      return;
    }

    const {
      p_name,
      description,
      short_description,
      price,
      offer_price,
      offer_label,
      delivery_time,
      category_id,
      finish_type_id,
      occasion_type_id,
      count,
      deleted_image_ids,
    } = req.body;

    if (!p_name || !price) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // 1️⃣ Update product fields
    await client.query(
      `UPDATE products SET
         p_name            = $1,
         description       = $2,
         short_description = $3,
         price             = $4,
         offer_price       = $5,
         offer_label       = $6,
         finish_type_id    = $7,
         delivery_time     = $8,
         count             = $9,
         category_id       = $10,
         occasion_type_id  = $11
       WHERE product_id = $12`,
      [
        p_name,
        description ?? null,
        short_description ?? null,
        price,
        toNullableNumber(offer_price),
        offer_label ?? null,
        finish_type_id ?? null,
        delivery_time ?? null,
        count ?? 0,
        category_id ?? null,
        occasion_type_id ?? null,
        productId,
      ],
    );

    // 2️⃣ Delete selected existing images from DB (Storage cleanup is best-effort)
    if (deleted_image_ids) {
      const ids: number[] = Array.isArray(deleted_image_ids)
        ? deleted_image_ids.map(Number)
        : [Number(deleted_image_ids)];

      if (ids.length) {
        // Fetch URLs before deleting so we can clean up Storage
        const urlResult = await client.query(
          `SELECT image_url FROM product_images WHERE image_id = ANY($1)`,
          [ids],
        );
        await client.query(
          `DELETE FROM product_images WHERE image_id = ANY($1)`,
          [ids],
        );
        // Best-effort Storage cleanup (outside transaction — failure won't rollback)
        const urls = urlResult.rows.map((r: { image_url: string }) => r.image_url);
        await deleteImagesFromStorage(urls);
      }
    }

    // 3️⃣ Upload and insert new images
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      logger.info(`[UPDATE-IMG] Uploading ${files.length} images for PID ${productId}`);

      const imageRows: [number, string, string, number][] = [];
      for (const [index, file] of files.entries()) {
        const publicUrl = await uploadImageToStorage(file, productId, index);
        imageRows.push([productId, publicUrl, file.originalname, index + 1]);
      }

      await client.query(
        format(
          'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES %L',
          imageRows,
        ),
      );
    }

    await client.query('COMMIT');

    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`❌ [UPDATE] Error updating product ${req.params.productId}: ${error instanceof Error ? error.message : error}`);
    next(error);
  } finally {
    client.release();
  }
};

// ─── Delete a product ─────────────────────────────────────────────────────────
export const deleteItem: RequestHandler = async (req, res, next) => {
  const client = await db.connect();
  await client.query('BEGIN');

  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      logger.error(`❌ [DELETE] Invalid PID: ${req.params.productId}`);
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    // Fetch image URLs before deleting (ON DELETE CASCADE removes them from DB automatically)
    const imageResult = await client.query(
      'SELECT image_url FROM product_images WHERE product_id = $1',
      [productId],
    );

    // Delete product — product_images rows cascade automatically
    await client.query('DELETE FROM products WHERE product_id = $1', [productId]);

    await client.query('COMMIT');

    // Best-effort Storage cleanup after successful DB commit
    const urls = imageResult.rows.map((r: { image_url: string }) => r.image_url);
    await deleteImagesFromStorage(urls);

    logger.info(`PID ${productId} deleted successfully`);
    res.status(200).json({ message: `Product ${productId} deleted successfully` });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`❌ [DELETE] Error deleting product: ${error instanceof Error ? error.message : error}`);
    next(error);
  } finally {
    client.release();
  }
};

// ─── Get filtered products ────────────────────────────────────────────────────
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const traceId = (req as any).traceId;
  const log = getLoggerWithTrace(traceId);

  try {
    // Support both "sort_by" and "sort" param names (frontend sends "sort")
    const { category, finish_type, occasion_type, sort_by, sort, is_available } = req.query;
    const sortParam = (sort_by || sort) as string | undefined;

    let sqlQuery = `
      SELECT
        p.product_id,
        p.p_name,
        p.description,
        p.short_description,
        p.price,
        p.offer_price,
        p.offer_label,
        f.name AS finish_type,
        p.delivery_time,
        p.count,
        c.name AS category,
        o.name AS occasion_type,
        STRING_AGG(pi.image_url, ',') AS image_urls,
        STRING_AGG(pi.alt_text,  ',') AS alt_texts,
        p.created_at
      FROM products p
      JOIN categories c      ON p.category_id      = c.category_id
      JOIN finish_types f    ON p.finish_type_id    = f.finish_type_id
      JOIN occasion_types o  ON p.occasion_type_id  = o.occasion_type_id
      LEFT JOIN product_images pi ON p.product_id   = pi.product_id
      WHERE 1 = 1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // is_available filter — "true" filters to available only, "false" returns all
    if (is_available === 'true') {
      sqlQuery += ` AND p.is_available = TRUE`;
    }

    // Support multiple categories (space, comma, or + separated)
    if (category) {
      const categories = (category as string)
        .split(/[ ,+]/)
        .map(c => c.trim())
        .filter(Boolean);

      if (categories.length > 0) {
        sqlQuery += ` AND c.name = ANY($${paramIndex})`;
        params.push(categories);
        paramIndex++;
      }
    }

    if (finish_type) {
      sqlQuery += ` AND f.name = $${paramIndex}`;
      params.push(finish_type);
      paramIndex++;
    }

    if (occasion_type) {
      sqlQuery += ` AND o.name = $${paramIndex}`;
      params.push(occasion_type);
      paramIndex++;
    }

    sqlQuery += ` GROUP BY p.product_id, c.name, f.name, o.name`;

    if (sortParam === 'price_asc') {
      sqlQuery += ` ORDER BY p.price ASC`;
    } else if (sortParam === 'price_desc') {
      sqlQuery += ` ORDER BY p.price DESC`;
    } else {
      sqlQuery += ` ORDER BY p.created_at DESC`;
    }

    const client = await db.connect();
    let rows: any[];
    try {
      const result = await client.query(sqlQuery, params);
      rows = result.rows;
    } finally {
      client.release();
    }

    const products: Product[] = rows.map((row: any) => {
      const imageUrls: string[] = row.image_urls ? row.image_urls.split(',') : [];
      const altTexts: string[]  = row.alt_texts  ? row.alt_texts.split(',')  : [];
      const images = imageUrls.map((url, i) => ({
        image_url: url,
        alt_text: altTexts[i] || '',
      }));
      return { ...row, images, image_urls: undefined, alt_texts: undefined };
    });

    res.json(products);
  } catch (err) {
    log.error(`❌ DB Error in getFilteredProducts: ${err instanceof Error ? err.message : err}`);
    next(err);
  }
};

// ─── Legacy in-memory helpers (kept for compatibility) ───────────────────────
export const getItems = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
};
