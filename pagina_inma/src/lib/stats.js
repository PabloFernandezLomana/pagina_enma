// pagina_inma/src/lib/stats.js — cálculos para el Inicio y las estadísticas.
import { todayISO } from './format';

export const countsAsSale = (o) => o.status !== 'Cancelado' && !['awaiting_payment', 'failed', 'cancelled'].includes(o.paymentStatus);

export const orderProfit = (o) => (o.items || []).reduce((s, l) => s + ((Number(l.unitPrice) || 0) - (Number(l.unitCost) || 0)) * (Number(l.quantity) || 0), 0);

export function lastDays(n) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }));
}

export function salesByDay(orders, n = 14) {
  const days = lastDays(n);
  const map = Object.fromEntries(days.map((d) => [d, 0]));
  orders.filter(countsAsSale).forEach((o) => {
    const d = new Date(o.createdAt).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    if (d in map) map[d] += o.total || 0;
  });
  return days.map((d) => ({ day: d, value: Math.round(map[d] * 100) / 100 }));
}

export function monthSummary(orders) {
  const ym = todayISO().slice(0, 7);
  const mine = orders.filter((o) => countsAsSale(o) && new Date(o.createdAt).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }).startsWith(ym));
  return { count: mine.length, revenue: mine.reduce((s, o) => s + (o.total || 0), 0), profit: mine.reduce((s, o) => s + orderProfit(o), 0) };
}

/** Agrega vistas / carritos de los últimos `n` días y unidades vendidas desde los pedidos. */
export function productRanking(stats, orders, products, n = 30) {
  const since = lastDays(n)[0];
  const acc = {};
  stats.filter((s) => s.date >= since).forEach((s) => {
    Object.entries(s.products || {}).forEach(([id, v]) => {
      acc[id] = acc[id] || { views: 0, carts: 0, sold: 0 };
      acc[id].views += v.views || 0; acc[id].carts += v.carts || 0;
    });
  });
  orders.filter(countsAsSale).forEach((o) => (o.items || []).forEach((l) => {
    acc[l.productId] = acc[l.productId] || { views: 0, carts: 0, sold: 0 };
    acc[l.productId].sold += l.quantity || 0;
  }));
  return Object.entries(acc).map(([id, v]) => ({ id, product: products.find((p) => p.id === id), ...v })).filter((r) => r.product);
}

export function funnel(stats, orders, n = 30) {
  const since = lastDays(n)[0];
  const recent = stats.filter((s) => s.date >= since);
  return {
    views: recent.reduce((s, x) => s + (x.views || 0), 0),
    carts: recent.reduce((s, x) => s + (x.carts || 0), 0),
    orders: orders.filter((o) => o.source === 'web' && o.status !== 'Cancelado' && new Date(o.createdAt).toLocaleDateString('sv-SE') >= since).length,
  };
}
