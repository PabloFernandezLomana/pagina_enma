// moda-enma-tienda/src/app/api/paypal/webhook/route.js
// Respaldo: si el navegador se cierra tras pagar, PayPal avisa aquí. Firma verificada.
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { verifyWebhook } from '@/lib/paypal.server';

export const runtime = 'nodejs';

export async function POST(request) {
  const db = getAdminDb();
  const raw = await request.text();
  if (!process.env.PAYPAL_WEBHOOK_ID) return NextResponse.json({ error: 'Webhook sin configurar' }, { status: 501 });
  if (!db || !(await verifyWebhook(request.headers, raw).catch(() => false))) {
    return NextResponse.json({ error: 'Firma no válida' }, { status: 400 });
  }
  const event = JSON.parse(raw);
  const res = event.resource || {};
  const orderId = res.custom_id;
  if (orderId) {
    const ref = db.collection('orders').doc(orderId);
    const snap = await ref.get();
    if (snap.exists) {
      const o = snap.data();
      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && o.paymentStatus === 'awaiting_payment' && Number(res.amount?.value).toFixed(2) === Number(o.total).toFixed(2)) {
        await ref.update({ paymentStatus: 'paid', paidAt: new Date().toISOString(), paypalCaptureId: res.id });
      } else if (['PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED'].includes(event.event_type)) {
        await ref.update({ paymentStatus: 'refunded' });
      } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
        await ref.update({ paymentStatus: 'failed' });
      }
    }
  }
  return NextResponse.json({ received: true });
}
