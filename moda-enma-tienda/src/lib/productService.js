import { db, collection, getDocs, doc, getDoc, query, where, isFirebaseConfigured } from './firebase';
import { CATEGORIES } from './mockCatalog';
import { getSharedCatalog } from './sharedData';

export async function getProducts(options = {}) {
  const { category, featuredOnly, search } = options;
  let allProducts = getSharedCatalog();

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'products'), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      const firestoreProducts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      if (firestoreProducts.length > 0) {
        const existingIds = new Set(firestoreProducts.map(p => p.id));
        const nonDuplicateMock = allProducts.filter(p => !existingIds.has(p.id));
        allProducts = [...firestoreProducts, ...nonDuplicateMock];
      }
    } catch (err) {
      console.warn("Firestore query warning (usando catálogo local compartido):", err);
    }
  }

  let list = allProducts.filter(p => p.active !== false);

  if (category && category.toLowerCase() !== 'todos') {
    const catObj = CATEGORIES.find(c => c.id === category.toLowerCase());
    const targetCategoryName = catObj ? catObj.name.toLowerCase() : category.toLowerCase();
    list = list.filter(p => p.category && p.category.toLowerCase() === targetCategoryName);
  }

  if (featuredOnly) {
    const featured = list.filter(p => p.isFeatured);
    if (featured.length >= 3) {
      list = featured;
    }
  }

  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) || 
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }

  return list;
}

export async function getProductById(id) {
  if (!id) return null;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn(`Firestore getProductById error for ${id}:`, err);
    }
  }

  const all = getSharedCatalog();
  return all.find(p => p.id === id) || null;
}

export function getCategoryInfo(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId.toLowerCase()) || null;
}
