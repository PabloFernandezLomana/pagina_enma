// moda-enma-tienda/src/lib/productShape.js
// Forma PÚBLICA de un producto (sin costPrice). Se usa en servidor y en navegador.
const toIso = (v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : v || null);

export function toPublicProduct(id, d) {
  const images = (Array.isArray(d.images) && d.images.length ? d.images : d.image ? [d.image] : []).filter(Boolean);
  return {
    id,
    name: d.name || 'Producto',
    department: d.department || 'mujer',
    category: d.category || 'Otros',
    sku: d.sku || '',
    description: d.description || '',
    salePrice: Number(d.salePrice) || 0,
    images,
    variants: (d.variants || []).map((x) => ({ size: String(x.size), stock: Math.max(0, Number(x.stock) || 0) })),
    tag: d.tag || '',
    featured: Boolean(d.featured),
    createdAt: toIso(d.createdAt),
  };
}

export const totalStock = (p) => p.variants.reduce((s, v) => s + v.stock, 0);
export const isSoldOut = (p) => totalStock(p) === 0;
export const isLastUnits = (p) => {
  const t = totalStock(p);
  return t > 0 && t <= 3;
};
