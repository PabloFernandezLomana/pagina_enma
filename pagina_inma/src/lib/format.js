// pagina_inma/src/lib/format.js
export const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
export const todayISO = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
export const pad4 = (n) => String(n).padStart(4, '0');

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `hace ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

/** Teléfono → solo dígitos con prefijo de España si falta. */
export function phoneDigits(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9) d = `34${d}`;
  return d;
}
export const whatsappUrl = (phone, text) => `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(text)}`;

export const totalStock = (p) => (p.variants || []).reduce((s, v) => s + (Number(v.stock) || 0), 0);
export const unitsLabel = (n) => `${n} ${n === 1 ? 'unidad' : 'unidades'}`;

export const DEPARTMENTS = [
  { id: 'mujer', name: 'Mujer', emoji: '👗', tint: '240 201 192' },
  { id: 'hombre', name: 'Hombre', emoji: '👔', tint: '190 208 222' },
  { id: 'ninos', name: 'Niños', emoji: '🧸', tint: '243 214 150' },
  { id: 'deporte', name: 'Deporte', emoji: '⚽', tint: '188 208 182' },
  { id: 'accesorios', name: 'Accesorios', emoji: '🧴', tint: '222 196 170' },
];
export const PRODUCT_TYPES = ['Vestidos', 'Blusas', 'Camisas', 'Pantalones', 'Chaquetas', 'Faldas', 'Camisetas y tops', 'Sudaderas', 'Conjuntos', 'Accesorios', 'Otros'];
export const TAGS = ['', 'Novedad', 'Más vendido', 'Últimas unidades', 'Oferta'];
export const SIZE_PRESETS = [
  { id: 'ropa', label: 'Ropa (XS–XL)', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'nino', label: 'Niño (4–12)', sizes: ['4', '6', '8', '10', '12'] },
  { id: 'unica', label: 'Talla única', sizes: ['Única'] },
];
export const STATUSES = ['Pendiente', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];
export const dept = (id) => DEPARTMENTS.find((d) => d.id === id) || DEPARTMENTS[0];

/** Stock bajo por defecto: 1 unidad o menos. Cada producto puede tener su propio umbral. */
export const LOW_STOCK_DEFAULT = 1;

/** Tallas agotadas y tallas con una última unidad (solo si el producto aún tiene stock en otras tallas). */
export function sizeAlerts(p) {
  const v = (p.variants || []).map((x) => ({ size: String(x.size), stock: Number(x.stock) || 0 }));
  if (!v.some((x) => x.stock > 0)) return { out: [], last: [] };
  return { out: v.filter((x) => x.stock === 0).map((x) => x.size), last: v.filter((x) => x.stock === 1).map((x) => x.size) };
}
