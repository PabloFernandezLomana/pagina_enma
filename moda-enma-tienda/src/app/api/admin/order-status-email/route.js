// moda-enma-tienda/src/app/api/admin/order-status-email/route.js
// El panel (otra web) llama aquí cuando cambias el estado de un pedido, para avisar al cliente por correo.
import { NextResponse } from 'next/server';
import { verifyAdminToken, allowedOrigins } from '@/lib/adminAuth.server';
import { sendOrderStatusEmail, sendOrderConfirmation } from '@/lib/notify.server';
import { emailConfigured } from '@/lib/email.server';
import { expireAbandonedOrders } from '@/lib/orders.server';
import { invalidateCatalog } from '@/lib/catalog.server';

export const runtime = 'nodejs';

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin',
});

const originOf = (request) => {
  const o = request.headers.get('origin') || '';
  return allowedOrigins().includes(o) ? o : null;
};

export async function OPTIONS(request) {
  const origin = originOf(request);
  return new NextResponse(null, { status: origin ? 204 : 403, headers: origin ? cors(origin) : {} });
}

export async function POST(request) {
  const origin = originOf(request);
  if (!origin) return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  const headers = cors(origin);
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!(await verifyAdminToken(token))) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers });

  let orderId;
  let action = 'status';
  try {
    ({ orderId, action = 'status' } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Petición no válida' }, { status: 400, headers });
  }

  // Acciones sin pedido concreto
  if (action === 'health') return NextResponse.json({ emailConfigured: emailConfigured() }, { status: 200, headers });
  if (action === 'expire') {
    const r = await expireAbandonedOrders({ force: true });
    if (r.released) invalidateCatalog();
    return NextResponse.json({ released: r.released || 0 }, { status: 200, headers });
  }

  if (typeof orderId !== 'string' || !/^[\w-]{3,40}$/.test(orderId)) return NextResponse.json({ error: 'Pedido no válido' }, { status: 400, headers });

  // 'confirmation' reintenta el correo de "pedido recibido"; 'status' avisa del estado actual
  const r = action === 'confirmation' ? await sendOrderConfirmation(orderId) : await sendOrderStatusEmail(orderId);
  return NextResponse.json({ sent: Boolean(r.ok && !r.skipped), skipped: Boolean(r.skipped), reason: r.reason || '', error: r.ok ? '' : r.error || 'No se pudo enviar' }, { status: 200, headers });
}
