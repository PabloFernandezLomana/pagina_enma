// moda-enma-tienda/src/lib/orders.server.js
// Creación de pedidos: TODO dentro de una transacción (lecturas primero, validación y precios
// desde la base de datos, stock descontado de forma atómica, número de pedido secuencial).
import { getAdminDb, FieldValue, isDemoAllowed } from './firebaseAdmin';
import { DEMO_PRODUCTS } from '@/data/demoProducts';
import { SITE_CONFIG, shippingCostFor, allowedPayments } from '@/site.config';

export class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const round2 = (n) => Math.round(n * 100) / 100;
export const todayMadrid = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

function mergeItems(items) {
  const map = new Map();
  for (const it of items) {
    const key = `${it.productId}__${it.size}`;
    const prev = map.get(key);
    map.set(key, { ...it, quantity: Math.min(10, (prev?.quantity || 0) + it.quantity) });
  }
  return [...map.values()];
}

export function validateMethods(shippingMethod, paymentMethod) {
  const m = SITE_CONFIG.shipping.methods[shippingMethod];
  if (!m || !m.enabled) throw new OrderError('Ese método de entrega no está disponible.');
  if (!allowedPayments(shippingMethod).includes(paymentMethod)) {
    throw new OrderError(
      shippingMethod === 'delivery'
        ? 'El envío a domicilio solo se puede pagar con PayPal.'
        : 'Ese método de pago no está disponible para esta entrega.'
    );
  }
}

export async function createOrder(data) {
  validateMethods(data.shippingMethod, data.paymentMethod);
  const items = mergeItems(data.items);
  const db = getAdminDb();

  // Sin base de datos: solo se permite un pedido de PRUEBA que no se guarda (nunca en producción).
  if (!db) {
    if (!isDemoAllowed()) throw new OrderError('La tienda no está lista para recibir pedidos todavía.', 503);
    if (data.paymentMethod === 'paypal') throw new OrderError('PayPal aún no está configurado.', 503);
    const lines = items.map((i) => {
      const p = DEMO_PRODUCTS.find((x) => x.id === i.productId);
      if (!p) throw new OrderError('Un producto de tu bolsa ya no está disponible.', 409);
      return { ...i, productName: p.name, unitPrice: p.salePrice, total: round2(p.salePrice * i.quantity) };
    });
    const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
    const shippingCost = shippingCostFor(data.shippingMethod, subtotal);
    return { demo: true, orderId: 'PRUEBA-0000', accessToken: '', total: round2(subtotal + shippingCost), subtotal, shippingCost, paypalOrderId: null };
  }

  const accessToken = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const now = new Date();
  const phoneDigits = data.phone.replace(/\D/g, '');
  const clientId = `cli-${phoneDigits}`;
  const method = SITE_CONFIG.shipping.methods[data.shippingMethod];
  let result;

  await db.runTransaction(async (tx) => {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const pRefs = productIds.map((id) => db.collection('products').doc(id));
    const privRefs = productIds.map((id) => db.collection('products_private').doc(id));
    const counterRef = db.doc('meta/counters');
    const statsRef = db.doc(`stats_daily/${todayMadrid()}`);
    const clientRef = db.collection('clients').doc(clientId);

    // 1) TODAS las lecturas primero
    const snaps = await tx.getAll(...pRefs, ...privRefs, counterRef, clientRef);
    const pSnaps = snaps.slice(0, productIds.length);
    const privSnaps = snaps.slice(productIds.length, productIds.length * 2);
    const counterSnap = snaps[productIds.length * 2];
    const clientSnap = snaps[productIds.length * 2 + 1];

    const products = new Map();
    productIds.forEach((id, idx) => {
      const s = pSnaps[idx];
      if (!s.exists || s.data().active !== true) throw new OrderError('Un producto de tu bolsa ya no está disponible.', 409);
      products.set(id, { data: s.data(), cost: Number(privSnaps[idx].data()?.costPrice) || 0, variants: (s.data().variants || []).map((v) => ({ ...v })) });
    });

    // 2) Validación y precios (siempre de la base de datos, nunca del navegador)
    const lines = items.map((it) => {
      const p = products.get(it.productId);
      const variant = p.variants.find((v) => String(v.size) === it.size);
      const stock = variant ? Number(variant.stock) || 0 : 0;
      if (!variant || stock < it.quantity) {
        throw new OrderError(
          stock > 0
            ? `Solo quedan ${stock} unidades de "${p.data.name}" en talla ${it.size}.`
            : `"${p.data.name}" en talla ${it.size} se ha agotado.`,
          409
        );
      }
      variant.stock = stock - it.quantity;
      const unitPrice = Number(p.data.salePrice);
      return {
        productId: it.productId,
        productName: p.data.name,
        sku: p.data.sku || '',
        image: (p.data.images && p.data.images[0]) || '',
        size: it.size,
        quantity: it.quantity,
        unitPrice,
        unitCost: p.cost,
        total: round2(unitPrice * it.quantity),
      };
    });

    const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
    const shippingCost = shippingCostFor(data.shippingMethod, subtotal);
    const total = round2(subtotal + shippingCost);
    const number = (counterSnap.exists ? Number(counterSnap.data().orders) || 0 : 0) + 1;
    const orderId = `PED-${now.getFullYear()}-${String(number).padStart(4, '0')}`;
    const isPaypal = data.paymentMethod === 'paypal';

    const order = {
      id: orderId,
      number,
      source: 'web',
      accessToken,
      clientId,
      clientName: data.fullName,
      clientEmail: data.email,
      clientPhone: data.phone,
      clientAddress:
        data.shippingMethod === 'delivery'
          ? `${data.address}, ${data.postalCode} ${data.city}`
          : 'Entrega en persona (Málaga)',
      shippingMethod: data.shippingMethod,
      shippingLabel: method.label,
      paymentMethod: data.paymentMethod,
      paymentStatus: isPaypal ? 'awaiting_payment' : 'pending',
      subtotal,
      shippingCost,
      total,
      items: lines,
      status: 'Pendiente',
      notes: data.notes || '',
      termsAcceptedAt: now.toISOString(),
      createdAt: now.toISOString(),
      invoiceGenerated: false,
    };

    // 3) Escrituras
    for (const [id, p] of products) tx.update(db.collection('products').doc(id), { variants: p.variants, updatedAt: now.toISOString() });
    tx.set(counterRef, { orders: number }, { merge: true });
    tx.set(db.collection('orders').doc(orderId), order);
    tx.set(
      clientRef,
      {
        id: clientId,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.shippingMethod === 'delivery' ? `${data.address}, ${data.postalCode} ${data.city}` : '',
        clientType: 'Cliente web',
        lastPurchaseDate: todayMadrid(),
        ordersCount: FieldValue.increment(1),
        ...(clientSnap.exists ? {} : { createdAt: now.toISOString().split('T')[0], totalSpent: 0 }),
      },
      { merge: true }
    );
    const productStats = {};
    for (const l of lines) productStats[l.productId] = { sold: FieldValue.increment(l.quantity) };
    tx.set(statsRef, { date: todayMadrid(), orders: FieldValue.increment(1), products: productStats }, { merge: true });

    result = { orderId, accessToken, total, subtotal, shippingCost, isPaypal, items: lines };
  });

  return { demo: false, ...result };
}

/** Devuelve el stock de un pedido (cancelación o pago abandonado). Idempotente. */
export async function releaseOrder(orderId, { requireToken, reason = 'Cancelado' } = {}) {
  const db = getAdminDb();
  if (!db) throw new OrderError('Sin base de datos.', 503);
  await db.runTransaction(async (tx) => {
    const ref = db.collection('orders').doc(orderId);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new OrderError('Pedido no encontrado.', 404);
    const o = snap.data();
    if (requireToken && o.accessToken !== requireToken) throw new OrderError('No autorizado.', 403);
    if (o.paymentStatus !== 'awaiting_payment') throw new OrderError('Este pedido ya no se puede cancelar.', 409);
    const ids = [...new Set(o.items.map((i) => i.productId))];
    const refs = ids.map((id) => db.collection('products').doc(id));
    const pSnaps = await tx.getAll(...refs);
    pSnaps.forEach((ps, idx) => {
      if (!ps.exists) return;
      const variants = (ps.data().variants || []).map((v) => {
        const back = o.items.filter((i) => i.productId === ids[idx] && i.size === String(v.size)).reduce((s, i) => s + i.quantity, 0);
        return back ? { ...v, stock: (Number(v.stock) || 0) + back } : v;
      });
      tx.update(refs[idx], { variants });
    });
    tx.update(ref, { status: 'Cancelado', paymentStatus: 'cancelled', notes: `${o.notes ? o.notes + ' · ' : ''}${reason}`, cancelledAt: new Date().toISOString() });
  });
}
