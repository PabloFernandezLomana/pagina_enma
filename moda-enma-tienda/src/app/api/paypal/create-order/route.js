// src/app/api/paypal/create-order/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateOrderTotalAndValidateStock } from '@/lib/serverPricing';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    size: z.string(),
    quantity: z.number().int().positive()
  })).min(1),
  shippingMethod: z.enum(['delivery', 'pickup']),
  postalCode: z.string().optional()
});

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = process.env.PAYPAL_ENV || 'sandbox';
  const baseUrl = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    // Modo simulación si aún no hay credenciales añadidas
    return { isMock: true, baseUrl };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  return { token: data.access_token, baseUrl };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos de pedido inválidos', details: parsed.error.issues }, { status: 400 });
    }

    const { items, shippingMethod, postalCode } = parsed.data;

    // Validación estricta de stock y recálculo de precios en el servidor
    const calculation = await calculateOrderTotalAndValidateStock(items, shippingMethod, postalCode);

    const { token, baseUrl, isMock } = await getPayPalAccessToken();

    if (isMock) {
      const mockOrderId = `PAYPAL-MOCK-${Date.now()}`;
      return NextResponse.json({
        id: mockOrderId,
        amount: calculation.total.toFixed(2),
        currency: 'EUR',
        isMock: true
      });
    }

    const paypalRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: calculation.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: calculation.subtotal.toFixed(2)
              },
              shipping: {
                currency_code: 'EUR',
                value: calculation.shippingCost.toFixed(2)
              }
            }
          },
          description: `Pedido ModaEnma Boutique (${items.length} artículos)`
        }],
        application_context: {
          brand_name: 'ModaEnma Boutique',
          locale: 'es-ES',
          user_action: 'PAY_NOW'
        }
      })
    });

    const paypalOrder = await paypalRes.json();
    return NextResponse.json({ id: paypalOrder.id });

  } catch (error) {
    console.error("Error en create-order PayPal:", error);
    return NextResponse.json({ error: error.message || 'Error al crear orden en PayPal' }, { status: 500 });
  }
}

