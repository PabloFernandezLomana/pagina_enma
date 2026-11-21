// moda-enma-tienda/src/lib/catalog.server.js
// Lectura del catálogo en servidor. NUNCA devuelve costPrice (vive en products_private).
import { unstable_cache } from 'next/cache';
import { getAdminDb, isDemoAllowed } from './firebaseAdmin';
import { DEMO_PRODUCTS } from '@/data/demoProducts';
import { toPublicProduct } from './productShape';

async function fetchAllFromFirestore() {
  const db = getAdminDb();
  const snap = await db.collection('products').where('active', '==', true).get();
  return snap.docs.map((doc) => toPublicProduct(doc.id, doc.data()));
}

const cachedFetch = unstable_cache(fetchAllFromFirestore, ['catalog-v2'], { revalidate: 30, tags: ['products'] });

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function sortProducts(list) {
  return [...list].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

export async function getAllProducts() {
  if (getAdminDb()) {
    try {
      return sortProducts(await cachedFetch());
    } catch (err) {
      console.error('[catalog] Error leyendo Firestore:', err.message);
      return [];
    }
  }
  return isDemoAllowed() ? sortProducts(DEMO_PRODUCTS.map((p) => toPublicProduct(p.id, p))) : [];
}

export async function getProducts({ department, search, featured, limit } = {}) {
  let list = await getAllProducts();
  if (department) list = list.filter((p) => p.department === department);
  if (featured) list = list.filter((p) => p.featured);
  if (search) {
    const q = norm(search);
    list = list.filter((p) => norm(`${p.name} ${p.category} ${p.description} ${p.sku}`).includes(q));
  }
  return limit ? list.slice(0, limit) : list;
}

export async function getProduct(id) {
  return (await getAllProducts()).find((p) => p.id === id) || null;
}
