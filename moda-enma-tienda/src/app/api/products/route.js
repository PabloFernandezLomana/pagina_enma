import { NextResponse } from 'next/server';
import { getSharedCatalog, saveSharedCatalog } from '@/lib/sharedData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  let products = getSharedCatalog();

  if (category && category.toLowerCase() !== 'todos') {
    products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json(products);
}

export async function POST(request) {
  try {
    const product = await request.json();
    let current = getSharedCatalog();

    if (product.id) {
      const idx = current.findIndex(p => p.id === product.id);
      if (idx > -1) {
        current[idx] = { ...current[idx], ...product };
      } else {
        current.unshift(product);
      }
    } else {
      const newId = `prod-${Date.now()}`;
      current.unshift({ ...product, id: newId, active: true });
    }

    saveSharedCatalog(current);
    return NextResponse.json({ success: true, products: current });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    let current = getSharedCatalog().filter(p => p.id !== id);
    saveSharedCatalog(current);
    return NextResponse.json({ success: true, products: current });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

