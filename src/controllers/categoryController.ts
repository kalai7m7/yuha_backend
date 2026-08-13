import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import logger from '../logger';

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = Date.now().toString(36);
  logger.info(`[${requestId}] 📦 getCategory() called`);

  try {
    const { rows } = await db.query(
      `SELECT category_id, name
       FROM categories
       ORDER BY category_id ASC`,
    );

    logger.info(`[${requestId}] ✅ Retrieved ${rows.length} categories`);
    res.status(200).json(rows);
  } catch (err) {
    logger.error(`[${requestId}] ❌ DB Error in getCategory(): ${(err as Error).message}`);
    res.status(500).json({
      message: 'Database error while fetching categories',
      details: (err as Error).message,
    });
    next(err);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = Date.now().toString(36);
  logger.info(`[${requestId}] 📦 getCategoryById() called`);

  try {
    const catId = parseInt(req.params.id, 10);

    if (isNaN(catId)) {
      logger.warn(`[${requestId}] ⚠️ Invalid category ID: ${req.params.id}`);
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    const { rows } = await db.query(
      `SELECT category_id, name
       FROM categories
       WHERE category_id = $1`,
      [catId],
    );

    if (rows.length === 0) {
      logger.info(`[${requestId}] 🕳️ No category found for ID: ${catId}`);
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    logger.info(`[${requestId}] ✅ Retrieved category ID ${catId}`);
    res.status(200).json(rows[0]);
  } catch (err) {
    logger.error(`[${requestId}] ❌ DB Error in getCategoryById(): ${(err as Error).message}`);
    res.status(500).json({
      message: 'Database error while fetching category',
      details: (err as Error).message,
    });
    next(err);
  }
};
