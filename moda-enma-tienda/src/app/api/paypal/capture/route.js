// moda-enma-tienda/src/app/api/paypal/capture/route.js
// Captura el pago EN SERVIDOR y comprueba importe, moneda y pedido antes de marcar "pagado".
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { capturePayPalOrder, paypalConfigured } from '@/lib/paypal.server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { sendOrderConfirmation } from '@/lib/notify.server';
import { runInBackground } from '@/lib/background.server';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!rateLimit(`capture:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 });
  }
  const db = getAdminDb();
  if (!db || !paypalConfigured()) return NextResponse.json({ error: 'PayPal no disponible' }, { status: 503 });

  try {
    const { orderId, accessToken, paypalOrderId } = await request.json();
    const ref = db.collection('orders').doc(String(orderId));
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    const order = snap.data();
    if (order.accessToken !== accessToken || order.paypalOrderId !== paypalOrderId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (order.paymentStatus === 'paid') return NextResponse.json({ success: true, alreadyPaid: true });
    if (order.paymentStatus !== 'awaiting_payment') {
      return NextResponse.json({ error: 'Este pedido ha caducado por falta de pago y se ha liberado la prenda. Vuelve a hacer el pedido.' }, { status: 409 });
    }

    const { ok, json } = await capturePayPalOrder(paypalOrderId);
    const unit = json?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const valid =
      ok && json.status === 'COMPLETED' && capture?.status === 'COMPLETED' &&
      (unit.custom_id === order.id || unit.reference_id === order.id) &&
      capture.amount?.currency_code === 'EUR' &&
      Math.abs(Number(capture.amount?.value) - order.total) < 0.005;

    if (!valid) {
      console.error('[paypal] captura no válida', order.id, json?.status, json?.name);
      return NextResponse.json({ error: 'El pago no se ha completado. No se ha cobrado nada o puedes reintentarlo.' }, { status: 402 });
    }
    await ref.update({
      paymentStatus: 'paid', paidAt: new Date().toISOString(), paypalCaptureId: capture.id,
      payerEmail: json.payer?.email_address || '',
    });
    await runInBackground(sendOrderConfirmation(order.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[paypal] capture error', err);
    return NextResponse.json({ error: 'No hemos podido confirmar el pago.' }, { status: 500 });
  }
}
