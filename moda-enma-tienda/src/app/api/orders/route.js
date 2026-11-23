// moda-enma-tienda/src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder, OrderError } from '@/lib/orders.server';
import { createPayPalOrder, paypalConfigured } from '@/lib/paypal.server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { releaseOrder } from '@/lib/orders.server';
import { sendOrderConfirmation } from '@/lib/notify.server';
import { runInBackground } from '@/lib/background.server';

export const runtime = 'nodejs';

const Schema = z
  .object({
    fullName: z.string().trim().min(2, 'Escribe tu nombre').max(80),
    email: z.string().trim().email('Correo no válido').max(120),
    phone: z.string().trim().min(9, 'Teléfono no válido').max(20),
    shippingMethod: z.enum(['delivery', 'meetup']),
    paymentMethod: z.enum(['paypal', 'cash']),
    address: z.string().trim().max(160).optional().default(''),
    city: z.string().trim().max(80).optional().default(''),
    postalCode: z.string().trim().max(10).optional().default(''),
    notes: z.string().trim().max(300).optional().default(''),
    termsAccepted: z.literal(true, { message: 'Debes aceptar los términos y la política de privacidad' }),
    honeypot: z.string().max(0).optional().default(''),
    items: z
      .array(z.object({ productId: z.string().min(1).max(80), size: z.string().min(1).max(12), quantity: z.number().int().min(1).max(10) }))
      .min(1, 'Tu bolsa está vacía')
      .max(30),
  })
  .superRefine((d, ctx) => {
    if (d.shippingMethod === 'delivery') {
      if (d.address.length < 5) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Escribe tu dirección' });
      if (d.city.length < 2) ctx.addIssue({ code: 'custom', path: ['city'], message: 'Escribe tu ciudad' });
      if (!/^\d{5}$/.test(d.postalCode)) ctx.addIssue({ code: 'custom', path: ['postalCode'], message: 'Código postal de 5 cifras' });
    }
    if (d.phone.replace(/\D/g, '').length < 9) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Teléfono no válido' });
  });

export async function POST(request) {
  if (!rateLimit(`order:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Demasiados intentos. Prueba de nuevo en unos minutos.' }, { status: 429 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const fields = {};
    for (const i of parsed.error.issues) fields[i.path.join('.') || 'form'] = i.message;
    return NextResponse.json({ error: Object.values(fields)[0] || 'Revisa los datos', fields }, { status: 400 });
  }
  if (!rateLimit(`order-email:${parsed.data.email.toLowerCase()}`, 5, 30 * 60 * 1000)) {
    return NextResponse.json({ error: 'Demasiados intentos con este correo. Prueba de nuevo en unos minutos.' }, { status: 429 });
  }
  if (parsed.data.honeypot) return NextResponse.json({ error: 'Petición rechazada.' }, { status: 400 });

  try {
    if (parsed.data.paymentMethod === 'paypal' && !paypalConfigured()) {
      return NextResponse.json({ error: 'PayPal aún no está disponible. Elige quedar en persona (efectivo) o inténtalo más tarde.' }, { status: 503 });
    }
    const order = await createOrder(parsed.data);
    let paypalOrderId = null;
    if (order.isPaypal && !order.demo) {
      try {
        paypalOrderId = await createPayPalOrder({ orderId: order.orderId, total: order.total, description: `Pedido ${order.orderId} · ModaEnma` });
        await getAdminDb().collection('orders').doc(order.orderId).update({ paypalOrderId });
      } catch (err) {
        console.error('[orders] PayPal falló, liberando stock:', err.message);
        await releaseOrder(order.orderId, { reason: 'PayPal no disponible' }).catch(() => {});
        return NextResponse.json({ error: 'No hemos podido iniciar el pago con PayPal. Inténtalo de nuevo.' }, { status: 502 });
      }
    }
    // Pago en efectivo: el pedido ya es firme, avisamos al cliente. (PayPal: se avisa cuando el pago se confirma.)
    if (!order.isPaypal && !order.demo) await runInBackground(sendOrderConfirmation(order.orderId));
    return NextResponse.json({
      success: true,
      demo: order.demo,
      orderId: order.orderId,
      accessToken: order.accessToken,
      total: order.total,
      shippingCost: order.shippingCost,
      paypalOrderId,
    });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[orders] Error inesperado:', err);
    return NextResponse.json({ error: 'No hemos podido procesar tu pedido. Inténtalo de nuevo.' }, { status: 500 });
  }
}
