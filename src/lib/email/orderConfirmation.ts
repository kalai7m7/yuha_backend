import { Resend } from 'resend';
import { logger } from '../logger';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: {
    product_name: string;
    product_image_url?: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  totalAmount: number;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: string;
}

function buildHtml(d: OrderEmailData): string {
  const itemRows = d.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb;">
          ${i.product_image_url ? `<img src="${i.product_image_url}" width="48" height="48" style="border-radius:4px;object-fit:cover;vertical-align:middle;margin-right:8px;" />` : ''}
          ${i.product_name}
        </td>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; text-align:center;">${i.quantity}</td>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; text-align:right;">₹${i.unit_price.toFixed(2)}</td>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; text-align:right;">₹${i.total_price.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const paymentLabel =
    d.paymentMethod === 'cod' ? 'Cash on Delivery' : d.paymentMethod.toUpperCase();

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#E2FCF3;font-family:Arial,sans-serif;color:#1f2328;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#008080;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">Yuha Exclusives</h1>
            <p style="margin:6px 0 0;color:#b2f0e8;font-size:13px;">Order Confirmation</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">

            <p style="margin:0 0 16px;font-size:15px;">Hi <strong>${d.customerName.split(' ')[0]}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#57606a;">
              Your order has been placed successfully. We'll process it shortly.
            </p>

            <!-- Order ID badge -->
            <div style="background:#f7f8fa;border:1px solid #e5e7eb;border-radius:6px;padding:14px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <p style="margin:0;font-size:11px;color:#57606a;text-transform:uppercase;letter-spacing:.5px;">Order ID</p>
                <p style="margin:4px 0 0;font-family:monospace;font-size:14px;font-weight:700;color:#008080;">${d.orderId}</p>
              </div>
              <span style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:4px;padding:4px 10px;font-size:12px;">${paymentLabel}</span>
            </div>

            <!-- Items table -->
            <h3 style="margin:0 0 12px;font-size:14px;color:#1f2328;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              <thead>
                <tr style="background:#f7f8fa;">
                  <th style="padding:8px 0;text-align:left;color:#57606a;font-weight:600;">Product</th>
                  <th style="padding:8px 0;text-align:center;color:#57606a;font-weight:600;">Qty</th>
                  <th style="padding:8px 0;text-align:right;color:#57606a;font-weight:600;">Price</th>
                  <th style="padding:8px 0;text-align:right;color:#57606a;font-weight:600;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:13px;">
              <tr>
                <td style="padding:4px 0;color:#57606a;">Subtotal</td>
                <td style="padding:4px 0;text-align:right;">₹${d.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#57606a;">Shipping</td>
                <td style="padding:4px 0;text-align:right;color:${d.shippingCost === 0 ? '#35b582' : '#1f2328'};">
                  ${d.shippingCost === 0 ? 'FREE' : `₹${d.shippingCost.toFixed(2)}`}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;font-weight:700;font-size:15px;border-top:2px solid #e5e7eb;">Grand Total</td>
                <td style="padding:8px 0 4px;text-align:right;font-weight:700;font-size:15px;color:#d4af37;border-top:2px solid #e5e7eb;">₹${d.grandTotal.toFixed(2)}</td>
              </tr>
            </table>

            <!-- Delivery address -->
            <div style="background:#f7f8fa;border:1px solid #e5e7eb;border-radius:6px;padding:14px 20px;margin-top:24px;">
              <p style="margin:0 0 8px;font-size:11px;color:#57606a;text-transform:uppercase;letter-spacing:.5px;">Delivery Address</p>
              <p style="margin:0;font-size:13px;line-height:1.6;">
                <strong>${d.customerName}</strong><br />
                ${d.shippingAddress}<br />
                ${d.shippingCity}, ${d.shippingState} – ${d.shippingPincode}
              </p>
            </div>

            <p style="margin:28px 0 0;font-size:13px;color:#57606a;">
              Questions? Reply to this email or WhatsApp us and we'll be happy to help.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f8fa;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#57606a;">© ${new Date().getFullYear()} Yuha Exclusives. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not set — skipping order confirmation email');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: data.customerEmail,
      subject: `Your Yuha order is confirmed! #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: buildHtml(data),
    });

    if (error) {
      logger.error({ error, orderId: data.orderId }, 'Failed to send order confirmation email');
      return false;
    }

    logger.info({ orderId: data.orderId, to: data.customerEmail }, 'Order confirmation email sent');
    return true;
  } catch (err) {
    // Never let email failure break the order flow
    logger.error({ err, orderId: data.orderId }, 'Exception sending order confirmation email');
    return false;
  }
}
