import { Router } from 'express';
import { getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';

const orderRouter = Router();

orderRouter.get('/', getOrders);
orderRouter.get('/:orderId', getOrderById);
orderRouter.put('/:orderId/status', updateOrderStatus);

export default orderRouter;
