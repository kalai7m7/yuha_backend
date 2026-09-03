import { supabaseAdmin } from '../../lib/supabase/admin';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../lib/logger';
import { findOrCreateCustomer } from '../customers/customer.repository';
import { sendOrderConfirmationEmail } from '../../lib/email/orderConfirmation';

export interface CreateOrderItemInput {
  product_id?: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderInput {
  customer: {
    name: string;
    email?: string;
    phone_number: string;
    alt_phone?: string;
  };
  shipping: {
    shipping_name: string;
    shipping_phone: string;
    shipping_alt_phone?: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
  };
  items: CreateOrderItemInput[];
  total_amount: number;
  shipping_cost?: number;
  discount_amount?: number;
  grand_total: number;
  payment_method: 'cod' | 'upi' | 'razorpay' | 'card';
  coupon_code?: string;
  notes?: string;
}

const ORDER_SELECT = `
  id, customer_id, order_date, total_amount, shipping_cost, discount_amount, grand_total,
  status, shipping_name, shipping_phone, shipping_alt_phone, shipping_address,
  shipping_city, shipping_state, shipping_pincode, payment_method, payment_status,
  tracking_number, coupon_code, notes, created_at, updated_at,
  order_items(id, product_id, product_name, product_image_url, quantity, unit_price, total_price),
  customers(id, name, email, phone_number, alternate_phone, status),
  payments(id, gateway, amount, currency, status, paid_at, created_at)
`;

export async function createOrder(input: CreateOrderInput) {
  // 1. Find or create customer (pass shipping address so the customer row is populated)
  const customer = await findOrCreateCustomer({
    name: input.customer.name,
    email: input.customer.email,
    phone_number: input.customer.phone_number,
    alternate_phone: input.customer.alt_phone,
    address_line: input.shipping.shipping_address,
    city: input.shipping.shipping_city,
    state: input.shipping.shipping_state,
    pincode: input.shipping.shipping_pincode,
  });

  // 2. Insert order header
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customer.id,
      total_amount: input.total_amount,
      shipping_cost: input.shipping_cost ?? 0,
      discount_amount: input.discount_amount ?? 0,
      grand_total: input.grand_total,
      status: 'pending',
      shipping_name: input.shipping.shipping_name,
      shipping_phone: input.shipping.shipping_phone,
      shipping_alt_phone: input.shipping.shipping_alt_phone ?? null,
      shipping_address: input.shipping.shipping_address,
      shipping_city: input.shipping.shipping_city,
      shipping_state: input.shipping.shipping_state,
      shipping_pincode: input.shipping.shipping_pincode,
      payment_method: input.payment_method,
      payment_status: input.payment_method === 'cod' ? 'pending' : 'pending',
      coupon_code: input.coupon_code ?? null,
      notes: input.notes ?? null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    logger.error({ error: orderError }, 'Failed to insert order');
    throw new AppError(500, `Failed to create order: ${orderError?.message}`, 'ORDER_CREATE_FAILED');
  }

  // 3. Insert order items
  const orderItemsData = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id || null,
    product_name: item.product_name,
    product_image_url: item.product_image_url || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    logger.error({ error: itemsError }, 'Failed to insert order items');
    throw new AppError(500, `Failed to save order items: ${itemsError.message}`, 'ORDER_ITEMS_CREATE_FAILED');
  }

  // 4. Create initial payment record
  await supabaseAdmin
    .from('payments')
    .insert({
      order_id: order.id,
      gateway: input.payment_method,
      amount: input.grand_total,
      currency: 'INR',
      status: 'pending',
    });

  // 5. Deduct inventory & record log
  for (const item of input.items) {
    if (item.product_id) {
      // decrement stock
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (prod) {
        const newStock = Math.max(0, (prod.stock_quantity || 0) - item.quantity);
        await supabaseAdmin
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        await supabaseAdmin
          .from('inventory_log')
          .insert({
            product_id: item.product_id,
            order_id: order.id,
            change: -item.quantity,
            reason: 'sale',
            note: `Order ${order.id}`,
          });
      }
    }
  }

  // 6. Send confirmation email and capture result (awaited but errors are swallowed inside)
  let emailSent = false;
  if (input.customer.email) {
    emailSent = await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      shippingAddress: input.shipping.shipping_address,
      shippingCity: input.shipping.shipping_city,
      shippingState: input.shipping.shipping_state,
      shippingPincode: input.shipping.shipping_pincode,
      items: input.items,
      totalAmount: input.total_amount,
      shippingCost: input.shipping_cost ?? 0,
      grandTotal: input.grand_total,
      paymentMethod: input.payment_method,
    });
  }

  // 7. Fetch complete hydrated order and attach email status
  const hydratedOrder = await getOrderById(order.id);
  return { ...hydratedOrder, emailSent };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listOrders(opts: PaginationOptions = {}): Promise<PaginatedResult<any>> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select(ORDER_SELECT, { count: 'exact' })
    .order('order_date', { ascending: false })
    .range(from, to);

  if (error) {
    logger.error({ error }, 'Failed to list orders');
    throw new AppError(500, `Failed to fetch orders: ${error.message}`, 'ORDER_QUERY_FAILED');
  }

  const total = count ?? 0;
  return {
    data: data ?? [],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getOrderById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  return data;
}

export async function updateOrderStatus(id: string, status: string, tracking_number?: string) {
  await getOrderById(id);

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (tracking_number !== undefined) {
    updateData.tracking_number = tracking_number;
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select(ORDER_SELECT)
    .single();

  if (error) {
    logger.error({ error, id }, 'Failed to update order status');
    throw new AppError(500, `Failed to update status: ${error.message}`, 'ORDER_UPDATE_FAILED');
  }

  return data;
}
