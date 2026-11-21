// moda-enma-tienda/src/lib/paypal.server.js
// PayPal Orders v2 (crear → capturar en servidor → webhook). Solo servidor.
const BASE = () =>
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

export const paypalConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function accessToken() {
  const basic = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${BASE()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal auth ${res.status}`);
  return (await res.json()).access_token;
}

async function call(path, init = {}) {
  const token = await accessToken();
  const res = await fetch(`${BASE()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function createPayPalOrder({ orderId, total, description }) {
  const { ok, json, status } = await call('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `create-${orderId}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          custom_id: orderId,
          invoice_id: orderId,
          description: String(description).slice(0, 120),
          amount: { currency_code: 'EUR', value: total.toFixed(2) },
        },
      ],
      payment_source: { paypal: { experience_context: { shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' } } },
    }),
  });
  if (!ok || !json.id) throw new Error(`PayPal no pudo crear el pago (${status})`);
  return json.id;
}

export async function capturePayPalOrder(paypalOrderId) {
  const { ok, json, status } = await call(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `capture-${paypalOrderId}` },
    body: '{}',
  });
  return { ok, status, json };
}

export async function verifyWebhook(headers, rawBody) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const { ok, json } = await call('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  return ok && json.verification_status === 'SUCCESS';
}
