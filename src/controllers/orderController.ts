// src/controllers/orderController.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import logger from '../logger';

/**
 * GET /api/orders
 * Returns paginated orders with basic customer info.
 * Query params: ?page=1&limit=20&status=pending
 */
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string, 10) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit as string, 10) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const params: any[] = [limit, offset];
    let whereClause = '';

    if (status && status !== 'all') {
      params.push(status);
      whereClause = `WHERE o.status = $${params.length}`;
    }

    const [ordersResult, countResult] = await Promise.all([
      db.query(
        `SELECT
           o.order_id,
           o.order_date,
           o.total_amount,
           o.grand_total,
           o.status,
           o.payment_status,
           o.payment_method,
           o.shipping_name   AS customer_name,
           o.shipping_phone  AS customer_phone,
           o.shipping_city   AS city,
           COUNT(oi.order_item_id) AS item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         ${whereClause}
         GROUP BY o.order_id
         ORDER BY o.order_date DESC
         LIMIT $1 OFFSET $2`,
        params,
      ),
      db.query(
        `SELECT COUNT(*) FROM orders o ${whereClause}`,
        status && status !== 'all' ? [status] : [],
      ),
    ]);

    res.json({
      orders: ordersResult.rows,
      total:  parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    });
  } catch (err) {
    logger.error(`❌ [ORDERS] Error fetching orders: ${(err as Error).message}`);
    next(err);
  }
};

/**
 * GET /api/orders/:orderId
 * Returns full order details including items.
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  try {
    const [orderResult, itemsResult] = await Promise.all([
      db.query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [orderId],
      ),
      db.query(
        `SELECT oi.*, p.p_name, p.price AS current_price
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = $1
         ORDER BY oi.order_item_id`,
        [orderId],
      ),
    ]);

    if (!orderResult.rows.length) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    logger.error(`❌ [ORDERS] Error fetching order ${req.params.orderId}: ${(err as Error).message}`);
    next(err);
  }
};

/**
 * PUT /api/orders/:orderId/status
 * Update order status. Body: { status: string }
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  try {
    const result = await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id, status`,
      [status, orderId],
    );

    if (!result.rows.length) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, ...result.rows[0] });
  } catch (err) {
    logger.error(`❌ [ORDERS] Error updating order ${req.params.orderId}: ${(err as Error).message}`);
    next(err);
  }
};
