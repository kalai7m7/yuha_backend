import { Request, Response } from 'express';
import {
  placeOrder,
  getAllOrders,
  getOrder,
  changeOrderStatus,
} from './order.service';
import { AppError } from '../../shared/errors/AppError';

const VALID_PAYMENT_METHODS = ['cod', 'upi', 'razorpay', 'card'] as const;
type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

function sanitisePaymentMethod(raw: unknown): PaymentMethod {
  if (typeof raw === 'string' && VALID_PAYMENT_METHODS.includes(raw as PaymentMethod)) {
    return raw as PaymentMethod;
  }
  return 'upi'; // safe fallback for online payments
}

export async function createOrderController(req: Request, res: Response) {
  const body = req.body;
  if (!body.customer || !body.shipping || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
    throw new AppError(400, 'Invalid order payload. Customer, shipping, and non-empty items are required.', 'INVALID_ORDER_DATA');
  }

  const order = await placeOrder({
    customer: {
      name: body.customer.name,
      email: body.customer.email,
      phone_number: body.customer.phone_number,
      alt_phone: body.customer.alt_phone,
    },
    shipping: {
      shipping_name: body.shipping.shipping_name || body.customer.name,
      shipping_phone: body.shipping.shipping_phone || body.customer.phone_number,
      shipping_alt_phone: body.shipping.shipping_alt_phone || body.customer.alt_phone,
      shipping_address: body.shipping.shipping_address,
      shipping_city: body.shipping.shipping_city,
      shipping_state: body.shipping.shipping_state,
      shipping_pincode: body.shipping.shipping_pincode,
    },
    items: body.items.map((i: any) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      product_image_url: i.product_image_url || i.thumbnail,
      quantity: Number(i.quantity) || 1,
      unit_price: Number(i.unit_price || i.price),
      total_price: (Number(i.unit_price || i.price)) * (Number(i.quantity) || 1),
    })),
    total_amount: Number(body.total_amount || body.totalPrice || 0),
    shipping_cost: Number(body.shipping_cost || 0),
    discount_amount: Number(body.discount_amount || 0),
    grand_total: Number(body.grand_total || body.totalPrice || 0),
    payment_method: sanitisePaymentMethod(body.payment_method),
    coupon_code: body.coupon_code,
    notes: body.notes,
  });

  res.status(201).json({ success: true, data: order });
}

export async function listOrdersController(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await getAllOrders({ page, limit });
  res.json({ success: true, data: result });
}

export async function getOrderController(req: Request, res: Response) {
  const order = await getOrder(req.params.id as string);
  res.json({ success: true, data: order });
}

export async function updateOrderStatusController(req: Request, res: Response) {
  const { status, tracking_number } = req.body;
  if (!status) {
    throw new AppError(400, 'Status is required', 'STATUS_REQUIRED');
  }
  const order = await changeOrderStatus(req.params.id as string, status, tracking_number);
  res.json({ success: true, data: order });
}
