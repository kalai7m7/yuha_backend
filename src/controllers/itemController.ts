import { Request, Response, NextFunction } from 'express';
import { items, Item } from '../models/item';
import { db } from '../db';
import { Product, ProductInput } from '../models/products';
import mysql from 'mysql2/promise';

// Create an item
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Create a new item........');
    const product: ProductInput = req.body;
    console.log('Product Received to create: ', product);
    const sql = `
      INSERT INTO products 
      (p_name, description, short_description, price, offer_price, offer_label, finish_type_id, delivery_time, count, category_id, occasion_type_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [
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
    ]);
    // Get the inserted product_id
    const insertedId = result.insertId;

    // Return 201 with product JSON (including product_id)
    res.status(201).json({ product_id: insertedId, ...product });
  } catch (error) {
    next(error);
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
export const deleteItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    const deletedItem = items.splice(itemIndex, 1)[0];
    res.json(deletedItem);
  } catch (error) {
    next(error);
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
