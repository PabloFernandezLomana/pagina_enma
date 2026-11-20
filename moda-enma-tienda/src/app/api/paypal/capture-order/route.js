// src/app/api/paypal/capture-order/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';

const CaptureSchema = z.object({
  orderId: z.string(),
  paypalOrderId: z.string()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = CaptureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Parámetros de captura inválidos' }, { status: 400 });
    }

    const { orderId, paypalOrderId } = parsed.data;

    // Si está configurada la base de datos, comprobar idempotencia
    if (adminDb) {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const snap = await orderRef.get();
      if (snap.exists) {
        const order = snap.data();
        if (order.paymentStatus === 'paid') {
          return NextResponse.json({ success: true, alreadyCaptured: true, orderId });
        }
      }
      await orderRef.update({
        paymentStatus: 'paid',
        paypalOrderId: paypalOrderId,
        paidAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, orderId, paypalOrderId });

  } catch (error) {
    console.error("Error capturando orden de PayPal:", error);
    return NextResponse.json({ error: error.message || 'Error en captura PayPal' }, { status: 500 });
  }
}

