// moda-enma-tienda/src/lib/catalog.server.js
// Lectura del catálogo en servidor. NUNCA devuelve costPrice (vive en products_private).
import { getAdminDb, isDemoAllowed } from './firebaseAdmin';
import { DEMO_PRODUCTS } from '@/data/demoProducts';
import { toPublicProduct } from './productShape';
import { expireAbandonedOrders } from './orders.server';

async function fetchAllFromFirestore() {
  const db = getAdminDb();
  const snap = await db.collection('products').where('active', '==', true).get();
  return snap.docs.map((doc) => toPublicProduct(doc.id, doc.data()));
}

// Caché en memoria de 30 s (por instancia): protege las lecturas gratuitas de Firestore.
// Si Firestore falla, se sirve el último catálogo bueno (aunque esté caducado) en vez de una tienda vacía.
let cache = { at: 0, data: null };
let failing = false;
async function cachedFetch() {
  if (cache.data && Date.now() - cache.at < 30_000) return cache.data;
  try {
    // Aprovechamos la visita para liberar stock de pagos PayPal abandonados (como mucho 1 vez por minuto).
    const { released } = await expireAbandonedOrders();
    if (released) cache = { at: 0, data: null };
    const data = await fetchAllFromFirestore();
    cache = { at: Date.now(), data };
    failing = false;
    return data;
  } catch (err) {
    failing = true;
    if (cache.data) {
      console.error('[catalog] Firestore falló, sirviendo la copia anterior:', err.message);
      return cache.data;
    }
    throw err;
  }
}

/** true si la última lectura del catálogo falló y no había copia: la web debe avisar, no fingir que no hay prendas. */
export const catalogUnavailable = () => failing && !cache.data;
export const invalidateCatalog = () => { cache = { at: 0, data: null }; };

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
