// pagina_inma/src/lib/demoSeed.js — datos de PRUEBA para VITE_DEMO=1 (nunca se usan en producción).
const iso = (daysAgo, h = 11) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, 0, 0, 0); return d.toISOString(); };
const day = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const v = (sizes, stocks) => sizes.map((size, i) => ({ size, stock: stocks[i] ?? 0 }));
const ropa = ['XS', 'S', 'M', 'L', 'XL'];
const nino = ['4', '6', '8', '10', '12'];

const P = [
  ['vestido-lino', 'Vestido midi de lino', 'mujer', 'Vestidos', 49.9, 21, v(ropa, [2, 4, 5, 3, 1]), 'Novedad', true],
  ['blusa-satin', 'Blusa de satén', 'mujer', 'Blusas', 29.9, 11, v(ropa, [3, 5, 4, 2, 0]), '', true],
  ['conjunto-punto', 'Conjunto de punto', 'mujer', 'Conjuntos', 54.9, 24, v(ropa, [1, 3, 3, 2, 1]), 'Últimas unidades', false],
  ['camisa-lino', 'Camisa de lino', 'hombre', 'Camisas', 39.9, 16, v(['S', 'M', 'L', 'XL', 'XXL'], [2, 5, 6, 3, 1]), '', true],
  ['pantalon-chino', 'Pantalón chino', 'hombre', 'Pantalones', 44.9, 19, v(['38', '40', '42', '44', '46'], [2, 4, 4, 3, 2]), '', false],
  ['sudadera', 'Sudadera con capucha', 'hombre', 'Sudaderas', 42.9, 18, v(['S', 'M', 'L', 'XL', 'XXL'], [3, 6, 5, 4, 2]), 'Novedad', false],
  ['camiseta-nino', 'Camiseta estampada niño', 'ninos', 'Camisetas y tops', 14.9, 5, v(nino, [4, 6, 6, 4, 2]), '', false],
  ['conjunto-nino', 'Conjunto chándal niño', 'ninos', 'Conjuntos', 29.9, 12, v(nino, [2, 3, 4, 3, 1]), '', false],
  ['camiseta-futbol', 'Camiseta de fútbol', 'deporte', 'Camisetas y tops', 34.9, 14, v(['S', 'M', 'L', 'XL', 'XXL'], [4, 6, 6, 3, 2]), 'Novedad', true],
  ['mallas', 'Mallas deportivas', 'deporte', 'Pantalones', 27.9, 10, v(ropa, [3, 5, 5, 3, 0]), '', false],
  ['botella-acero', 'Botella de acero 750 ml', 'accesorios', 'Accesorios', 19.9, 7, v(['Única'], [12]), 'Más vendido', true],
  ['bolso-tote', 'Bolso tote de algodón', 'accesorios', 'Accesorios', 16.9, 5.5, v(['Única'], [8]), '', false],
];

export function DEMO_SEED() {
  const products = {}; const products_private = {};
  P.forEach(([slug, name, department, category, salePrice, cost, variants, tag, featured], i) => {
    const id = `demo-${slug}`;
    products[id] = { name, department, category, salePrice, variants, tag, featured, sku: `DEMO-${String(i + 1).padStart(2, '0')}`, description: 'Producto de demostración.', images: [`/demo/${slug}.webp`], active: true, demo: true, lowStockThreshold: 3, createdAt: iso(20 - i), updatedAt: iso(20 - i) };
    products_private[id] = { costPrice: cost };
  });
  const line = (slug, size, q) => { const p = P.find((x) => x[0] === slug); return { productId: `demo-${slug}`, productName: p[1], sku: '', image: `/demo/${slug}.webp`, size, quantity: q, unitPrice: p[4], unitCost: p[5], total: Math.round(p[4] * q * 100) / 100 }; };
  const mk = (n, ago, name, phone, items, ship, pay, status, payStatus, source = 'web') => {
    const sub = items.reduce((s, l) => s + l.total, 0);
    const shippingCost = ship === 'delivery' ? 3.9 : 0;
    return [`PED-2026-${String(n).padStart(4, '0')}`, { id: `PED-2026-${String(n).padStart(4, '0')}`, number: n, source, clientId: `cli-${phone}`, clientName: name, clientPhone: phone, clientEmail: '', clientAddress: ship === 'delivery' ? 'Calle Larios 10, 29005 Málaga' : 'Entrega en persona (Málaga)', shippingMethod: ship, shippingLabel: ship === 'delivery' ? 'Envío a domicilio' : 'Quedar en persona (Málaga)', paymentMethod: pay, paymentStatus: payStatus, subtotal: sub, shippingCost, total: Math.round((sub + shippingCost) * 100) / 100, items, status, notes: '', createdAt: iso(ago), invoiceGenerated: false }];
  };
  const orders = Object.fromEntries([
    mk(1, 9, 'Lucía Romero', '600111222', [line('vestido-lino', 'M', 1), line('botella-acero', 'Única', 1)], 'delivery', 'paypal', 'Entregado', 'paid'),
    mk(2, 7, 'Carlos Ruiz', '611222333', [line('camisa-lino', 'L', 1)], 'meetup', 'cash', 'Entregado', 'paid', 'panel'),
    mk(3, 5, 'Marta Gil', '622333444', [line('camiseta-nino', '8', 2), line('conjunto-nino', '8', 1)], 'delivery', 'paypal', 'Enviado', 'paid'),
    mk(4, 3, 'Pablo Soto', '633444555', [line('camiseta-futbol', 'M', 1), line('mallas', 'S', 1)], 'meetup', 'cash', 'Preparando', 'pending'),
    mk(5, 2, 'Ana Torres', '644555666', [line('blusa-satin', 'S', 1)], 'delivery', 'paypal', 'Pendiente', 'paid'),
    mk(6, 1, 'Irene Vidal', '655666777', [line('botella-acero', 'Única', 2)], 'meetup', 'cash', 'Pendiente', 'pending'),
    mk(7, 0, 'Sergio León', '666777888', [line('sudadera', 'L', 1)], 'delivery', 'paypal', 'Pendiente', 'awaiting_payment'),
  ]);
  const clients = {};
  Object.values(orders).forEach((o) => { clients[o.clientId] = { name: o.clientName, phone: o.clientPhone, email: '', address: '', clientType: o.source === 'web' ? 'Cliente web' : 'Cliente', createdAt: o.createdAt.slice(0, 10) }; });
  const stats_daily = {};
  for (let i = 13; i >= 0; i--) {
    const views = 20 + ((i * 7) % 23) + (i < 5 ? 15 : 0);
    stats_daily[day(i)] = { date: day(i), views, carts: Math.round(views / 6), orders: i % 3 === 0 ? 1 : 0, products: { 'demo-vestido-lino': { views: Math.round(views * 0.3), carts: 2 }, 'demo-botella-acero': { views: Math.round(views * 0.22), carts: 1 }, 'demo-camiseta-futbol': { views: Math.round(views * 0.18) }, 'demo-camisa-lino': { views: Math.round(views * 0.1) } } };
  }
  return { products, products_private, orders, clients, invoices: {}, templates: {}, tasks: {}, settings: {}, stats_daily, meta: { counters: { orders: 7, invoices: 0 } } };
}
