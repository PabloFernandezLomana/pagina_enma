// moda-enma-tienda/src/app/api/cart/check/route.js
// Devuelve precio y stock ACTUALES de lo que hay en la bolsa (para no enseñar datos antiguos).
import { NextResponse } from 'next/server';
import { getAllProducts, catalogUnavailable } from '@/lib/catalog.server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!rateLimit(`cart:${clientIp(request)}`, 60, 10 * 60 * 1000)) return NextResponse.json({ items: [] }, { status: 429 });
  try {
    const { items } = await request.json();
    const all = await getAllProducts();
    if (catalogUnavailable()) return NextResponse.json({ items: [], unavailable: true }, { status: 503 });
    const out = (Array.isArray(items) ? items.slice(0, 30) : []).map((it) => {
      const p = all.find((x) => x.id === it.productId);
      const v = p?.variants.find((x) => x.size === it.size);
      return { key: it.key, available: Boolean(p && v), price: p?.salePrice ?? null, stock: v?.stock ?? 0, name: p?.name, image: p?.images[0] || '' };
    });
    return NextResponse.json({ items: out });
  } catch {
    return NextResponse.json({ items: [] }, { status: 400 });
  }
}
