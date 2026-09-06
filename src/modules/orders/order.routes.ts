import { Router } from 'express';
import {
  createOrderController,
  listOrdersController,
  getOrderController,
  updateOrderStatusController,
} from './order.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

export const orderRouter = Router();

// Public: Customer place order
orderRouter.post('/', createOrderController);

// Protected Admin: List, view details, and update status
orderRouter.get('/', requireAuth, requireAdmin, listOrdersController);
orderRouter.get('/:id', requireAuth, requireAdmin, getOrderController);
orderRouter.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatusController);
