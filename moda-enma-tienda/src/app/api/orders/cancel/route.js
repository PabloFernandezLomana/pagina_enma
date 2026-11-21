// moda-enma-tienda/src/app/api/orders/cancel/route.js
// El cliente cancela su propio pedido SOLO si aún espera el pago de PayPal (devuelve el stock).
import { NextResponse } from 'next/server';
import { releaseOrder, OrderError } from '@/lib/orders.server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!rateLimit(`cancel:${clientIp(request)}`, 10, 10 * 60 * 1000)) return NextResponse.json({ error: 'Demasiados intentos.' }, { status: 429 });
  try {
    const { orderId, accessToken } = await request.json();
    if (typeof orderId !== 'string' || typeof accessToken !== 'string') throw new OrderError('Datos no válidos.');
    await releaseOrder(orderId, { requireToken: accessToken, reason: 'Pago PayPal no completado' });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'No se pudo cancelar.' }, { status: 500 });
  }
}
