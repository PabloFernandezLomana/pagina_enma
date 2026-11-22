// moda-enma-tienda/src/app/api/track/route.js
// Contadores anónimos (vistas de producto y "añadir a la bolsa") para las estadísticas del panel.
import { NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '@/lib/firebaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { todayMadrid } from '@/lib/orders.server';

export const runtime = 'nodejs';

export async function POST(request) {
  const db = getAdminDb();
  if (!db) return NextResponse.json({ ok: true });
  if (!rateLimit(`track:${clientIp(request)}`, 120, 10 * 60 * 1000)) return NextResponse.json({ ok: true });
  const { type, productId } = await request.json().catch(() => ({}));
  if (!['view', 'cart'].includes(type) || typeof productId !== 'string' || !/^[\w-]{1,80}$/.test(productId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const field = type === 'view' ? 'views' : 'carts';
  await db.doc(`stats_daily/${todayMadrid()}`).set(
    { date: todayMadrid(), [field]: FieldValue.increment(1), products: { [productId]: { [field]: FieldValue.increment(1) } } },
    { merge: true }
  ).catch((e) => console.warn('[track]', e.message));
  return NextResponse.json({ ok: true });
}
