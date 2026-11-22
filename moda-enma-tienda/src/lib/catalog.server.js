// moda-enma-tienda/src/lib/catalog.server.js
// Lectura del catálogo en servidor. NUNCA devuelve costPrice (vive en products_private).
import { getAdminDb, isDemoAllowed } from './firebaseAdmin';
import { DEMO_PRODUCTS } from '@/data/demoProducts';
import { toPublicProduct } from './productShape';

async function fetchAllFromFirestore() {
  const db = getAdminDb();
  const snap = await db.collection('products').where('active', '==', true).get();
  return snap.docs.map((doc) => toPublicProduct(doc.id, doc.data()));
}

// Caché en memoria de 30 s (por instancia): protege las lecturas gratuitas de Firestore.
let cache = { at: 0, data: null };
async function cachedFetch() {
  if (cache.data && Date.now() - cache.at < 30_000) return cache.data;
  const data = await fetchAllFromFirestore();
  cache = { at: Date.now(), data };
  return data;
}

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
