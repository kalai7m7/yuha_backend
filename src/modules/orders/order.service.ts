import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  CreateOrderInput,
  PaginationOptions,
} from './order.repository';

export async function placeOrder(input: CreateOrderInput) {
  return createOrder(input);
}

export async function getAllOrders(opts: PaginationOptions = {}) {
  return listOrders(opts);
}

export async function getOrder(id: string) {
  return getOrderById(id);
}

export async function changeOrderStatus(id: string, status: string, tracking_number?: string) {
  return updateOrderStatus(id, status, tracking_number);
}
