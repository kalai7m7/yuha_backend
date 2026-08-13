// src/controllers/customerController.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import logger from '../logger';

/**
 * GET /api/customers
 * Returns paginated customers with order stats.
 * Query params: ?page=1&limit=20&search=name_or_phone&status=active
 */
export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string, 10) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit as string, 10) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.name ILIKE $${params.length} OR c.phone_number ILIKE $${params.length} OR c.email ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryParams  = [...params, limit, offset];
    const countParams  = [...params];

    const [customersResult, countResult] = await Promise.all([
      db.query(
        `SELECT
           c.customer_id,
           c.name,
           c.email,
           c.phone_number,
           c.status,
           c.created_at,
           COUNT(o.order_id)         AS order_count,
           COALESCE(SUM(o.grand_total), 0) AS total_spent
         FROM customers c
         LEFT JOIN orders o ON c.customer_id = o.customer_id
         ${whereClause}
         GROUP BY c.customer_id
         ORDER BY c.created_at DESC
         LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams,
      ),
      db.query(
        `SELECT COUNT(*) FROM customers c ${whereClause}`,
        countParams,
      ),
    ]);

    res.json({
      customers: customersResult.rows,
      total:     parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    });
  } catch (err) {
    logger.error(`❌ [CUSTOMERS] Error fetching customers: ${(err as Error).message}`);
    next(err);
  }
};

/**
 * GET /api/customers/:customerId
 * Returns one customer with their order history.
 */
export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const customerId = parseInt(req.params.customerId, 10);
  if (isNaN(customerId)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }

  try {
    const [customerResult, ordersResult] = await Promise.all([
      db.query('SELECT * FROM customers WHERE customer_id = $1', [customerId]),
      db.query(
        `SELECT order_id, order_date, grand_total, status, payment_status
         FROM orders WHERE customer_id = $1 ORDER BY order_date DESC`,
        [customerId],
      ),
    ]);

    if (!customerResult.rows.length) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ ...customerResult.rows[0], orders: ordersResult.rows });
  } catch (err) {
    logger.error(`❌ [CUSTOMERS] Error fetching customer ${req.params.customerId}: ${(err as Error).message}`);
    next(err);
  }
};
