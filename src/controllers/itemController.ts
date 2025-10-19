import { Request, Response, NextFunction, RequestHandler } from 'express';
import { items, Item } from '../models/item';
import { db } from '../db';
import { Product, ProductInput } from '../models/products';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

// Create an item
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Cast to include Multer files
    const reqWithFiles = req as Request & { files?: Express.Multer.File[] };

    // Convert body safely
    const rawBody: unknown = reqWithFiles.body;
    const product: ProductInput = rawBody as ProductInput;

    // Insert product
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO products 
      (p_name, description, short_description, price, offer_price, offer_label, 
       finish_type_id, delivery_time, count, category_id, occasion_type_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.p_name,
        product.description || null,
        product.short_description || null,
        product.price,
        product.offer_price || null,
        product.offer_label || null,
        product.finish_type_id || null,
        product.delivery_time || null,
        product.count || 0,
        product.category_id || null,
        product.occasion_type_id || null,
      ],
    );

    const insertedId = result.insertId;

    // Insert images if any
    console.log('Created PID: ', insertedId);
    if (reqWithFiles.files && reqWithFiles.files.length > 0) {
      console.log('Added images for PID: ', insertedId);
      const images = reqWithFiles.files.map((file, index) => [
        insertedId,
        `/uploads/${file.filename}`,
        file.originalname,
        index + 1,
      ]);

      await connection.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES ?`,
        [images],
      );
    }

    await connection.commit();

    res
      .status(201)
      .json({ message: 'Product created', product_id: insertedId, ...product });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Read all items
export const getItems = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('inside');
    const sqlQuery = `SELECT 
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
        GROUP_CONCAT(pi.image_url) AS image_urls,
        GROUP_CONCAT(pi.alt_text) AS alt_texts,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN finish_types f ON p.finish_type_id = f.finish_type_id
      JOIN occasion_types o ON p.occasion_type_id = o.occasion_type_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      GROUP BY p.product_id
      ORDER BY p.product_id`;
    const [rows] = await db.query(sqlQuery);
    const products: Product[] = (rows as any[]).map((row) => {
      const imageUrls = row.image_urls ? row.image_urls.split(',') : [];
      const altTexts = row.alt_texts ? row.alt_texts.split(',') : [];

      const images = imageUrls.map((url: string, i: number) => ({
        image_url: url,
        alt_text: altTexts[i] || '',
      }));

      return {
        ...row,
        images,
        image_urls: undefined, // remove raw comma string
        alt_texts: undefined, // remove raw comma string
      };
    });

    console.log('get all products------>', products[0]);
    res.json(products);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Database error');
  }
};

// Read single item
export const getItemById = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = items.find((i) => i.id === id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    items[itemIndex].name = name;
    res.json(items[itemIndex]);
  } catch (error) {
    next(error);
  }
};

// Delete an item
export const deleteItem: RequestHandler = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return; // ensure no further execution
    }

    // Fetch images to delete from disk
    const [images] = await connection.query(
      "SELECT image_url FROM product_images WHERE product_id = ?",
      [productId]
    );

    // Delete files from /uploads folder
    (images as any[]).forEach((img) => {
      const filePath = path.join(__dirname, "../../public", img.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Delete product
    await connection.query("DELETE FROM products WHERE product_id = ?", [
      productId,
    ]);

    await connection.commit();
    console.log(`PID ${productId} deleted successfully`);
    res.status(200).json({ message: `Product ${productId} deleted successfully` });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting product:", error);
    next(error);
  } finally {
    connection.release();
  }
};

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      category,
      finish_type,
      occasion_type,
      sort_by, // "price_asc", "price_desc", "latest"
    } = req.query;

    // Base query
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
        GROUP_CONCAT(pi.image_url) AS image_urls,
        GROUP_CONCAT(pi.alt_text) AS alt_texts,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN finish_types f ON p.finish_type_id = f.finish_type_id
      JOIN occasion_types o ON p.occasion_type_id = o.occasion_type_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (category) {
      sqlQuery += ` AND c.name = ?`;
      params.push(category);
    }

    if (finish_type) {
      sqlQuery += ` AND f.name = ?`;
      params.push(finish_type);
    }

    if (occasion_type) {
      sqlQuery += ` AND o.name = ?`;
      params.push(occasion_type);
    }

    sqlQuery += ` GROUP BY p.product_id`;

    // Sorting
    if (sort_by === 'price_asc') {
      sqlQuery += ` ORDER BY p.price ASC`;
    } else if (sort_by === 'price_desc') {
      sqlQuery += ` ORDER BY p.price DESC`;
    } else {
      sqlQuery += ` ORDER BY p.created_at DESC`; // default
    }

    const [rows] = await db.query(sqlQuery, params);

    const products = (rows as any[]).map((row) => {
      const imageUrls = row.image_urls?.split(',') || [];
      const altTexts = row.alt_texts?.split(',') || [];
      const images = imageUrls.map((url: string, i: number) => ({
        image_url: url,
        alt_text: altTexts[i] || '',
      }));

      return {
        ...row,
        images,
        image_urls: undefined,
        alt_texts: undefined,
      };
    });

    res.json(products);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Database error');
  }
};
