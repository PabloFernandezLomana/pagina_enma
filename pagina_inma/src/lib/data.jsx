// pagina_inma/src/lib/data.jsx
// Datos en tiempo real + todas las operaciones del negocio (una sola vez, sobre la capa `backend`).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SITE_CONFIG } from '../site.config';
import { pad4, todayISO, phoneDigits } from './format';
import { DEFAULT_TEMPLATES } from './templates';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

const COLS = ['products', 'products_private', 'orders', 'clients', 'invoices', 'templates', 'settings', 'stats_daily'];

export class BusinessError extends Error {}

export function DataProvider({ backend, children }) {
  const [raw, setRaw] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubs = COLS.map((col) =>
      backend.subscribe(col, (rows, err) => {
        if (err) setErrors((e) => ({ ...e, [col]: err.code || 'error' }));
        else setRaw((r) => ({ ...r, [col]: rows }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [backend]);

  const ready = COLS.every((c) => raw[c] || errors[c]);

  const products = useMemo(() => {
    const priv = Object.fromEntries((raw.products_private || []).map((p) => [p.id, p]));
    return (raw.products || [])
      .map((p) => ({ ...p, costPrice: Number(priv[p.id]?.costPrice) || 0 }))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [raw.products, raw.products_private]);
  const orders = useMemo(() => [...(raw.orders || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))), [raw.orders]);
  const clients = useMemo(() => [...(raw.clients || [])].sort((a, b) => String(a.name).localeCompare(String(b.name))), [raw.clients]);
  const invoices = useMemo(() => [...(raw.invoices || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))), [raw.invoices]);
  const stats = raw.stats_daily || [];
  const business = useMemo(() => (raw.settings || []).find((s) => s.id === 'business') || {}, [raw.settings]);
  const templates = useMemo(() => {
    const saved = Object.fromEntries((raw.templates || []).map((t) => [t.id, t.text]));
    return { ...DEFAULT_TEMPLATES, ...saved };
  }, [raw.templates]);

  /* ---------------------------- Productos ---------------------------- */
  const saveProduct = useCallback(async (p) => {
    const id = p.id || `prod-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const { costPrice, ...pub } = p;
    await backend.batch([
      ['set', 'products', id, { ...pub, id: undefined, salePrice: Number(p.salePrice) || 0, active: p.active ?? true, createdAt: p.createdAt || now, updatedAt: now }, false],
      ['set', 'products_private', id, { costPrice: Number(costPrice) || 0 }, true],
    ]);
    return id;
  }, [backend]);

  const deleteProduct = useCallback((id) => backend.batch([['del', 'products', id], ['del', 'products_private', id]]), [backend]);
  const setActive = useCallback((id, active) => backend.set('products', id, { active, updatedAt: new Date().toISOString() }, true), [backend]);
  const setStock = useCallback((id, variants) => backend.set('products', id, { variants, updatedAt: new Date().toISOString() }, true), [backend]);
  const deleteDemoProducts = useCallback(async () => {
    const demo = products.filter((p) => p.demo);
    await backend.batch(demo.flatMap((p) => [['del', 'products', p.id], ['del', 'products_private', p.id]]));
    return demo.length;
  }, [backend, products]);

  /* ----------------------------- Pedidos ----------------------------- */
  const adjustStock = async (tx, items, direction) => {
    const ids = [...new Set(items.map((i) => i.productId))];
    const docs = await Promise.all(ids.map((id) => tx.get('products', id)));
    docs.forEach((doc, idx) => {
      if (!doc) return;
      const variants = (doc.variants || []).map((v) => {
        const qty = items.filter((i) => i.productId === ids[idx] && i.size === String(v.size)).reduce((s, i) => s + i.quantity, 0);
        if (!qty) return v;
        const next = (Number(v.stock) || 0) + (direction === 'restore' ? qty : -qty);
        if (next < 0) throw new BusinessError(`No queda stock suficiente de "${doc.name}" en talla ${v.size}.`);
        return { ...v, stock: next };
      });
      tx.set('products', ids[idx], { variants, updatedAt: new Date().toISOString() }, true);
    });
  };

  const setOrderStatus = useCallback((orderId, newStatus) =>
    backend.transact(async (tx) => {
      const o = await tx.get('orders', orderId);
      if (!o) throw new BusinessError('Pedido no encontrado.');
      if (o.status === newStatus) return;
      const patch = { status: newStatus };
      const now = new Date().toISOString();
      if (newStatus === 'Enviado' && !o.shippedAt) patch.shippedAt = now;
      if (newStatus === 'Entregado') {
        if (!o.deliveredAt) patch.deliveredAt = now;
        if (o.paymentMethod === 'cash' && o.paymentStatus === 'pending') { patch.paymentStatus = 'paid'; patch.paidAt = now; }
      }
      if (o.status !== 'Cancelado' && newStatus === 'Cancelado') {
        await adjustStock(tx, o.items, 'restore');
        if (o.paymentStatus === 'awaiting_payment') patch.paymentStatus = 'cancelled';
        patch.cancelledAt = now;
      } else if (o.status === 'Cancelado' && newStatus !== 'Cancelado') {
        await adjustStock(tx, o.items, 'deduct');
        if (o.paymentStatus === 'cancelled') patch.paymentStatus = 'pending';
      }
      tx.set('orders', orderId, patch, true);
    }), [backend]);

  const markPaid = useCallback((orderId) => backend.set('orders', orderId, { paymentStatus: 'paid', paidAt: new Date().toISOString() }, true), [backend]);
  const saveOrderNotes = useCallback((orderId, notes) => backend.set('orders', orderId, { notes }, true), [backend]);
  const saveOrderTracking = useCallback((orderId, { trackingCode, carrier }) => backend.set('orders', orderId, { trackingCode: (trackingCode || '').trim(), carrier: (carrier || '').trim() }, true), [backend]);

  /** Pide a la tienda que avise al cliente por correo del estado actual del pedido. Nunca lanza: devuelve { sent, skipped, error }. */
  const notifyOrderEmail = useCallback(async (orderId) => {
    if (backend.mode !== 'firebase') return { skipped: true, reason: 'En modo prueba no se envían correos.' };
    const base = String(import.meta.env.VITE_STORE_URL || '').replace(/\/$/, '');
    if (!base) return { error: 'Falta configurar la dirección de la tienda (VITE_STORE_URL).' };
    try {
      const token = await backend.auth.getIdToken();
      const res = await fetch(`${base}/api/admin/order-status-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { error: json.error || `La tienda respondió ${res.status}` };
      return json;
    } catch {
      return { error: 'No se pudo conectar con la tienda.' };
    }
  }, [backend]);

  /** Venta registrada a mano (en persona / por WhatsApp). Descuenta stock y numera como la web. */
  const createManualOrder = useCallback(({ client, items, shippingMethod, paymentMethod, status, notes }) =>
    backend.transact(async (tx) => {
      if (!items.length) throw new BusinessError('Añade al menos un producto.');
      const ids = [...new Set(items.map((i) => i.productId))];
      const [counters, ...docs] = await Promise.all([tx.get('meta', 'counters'), ...ids.map((id) => tx.get('products', id)), ...ids.map((id) => tx.get('products_private', id))]);
      const prods = docs.slice(0, ids.length);
      const privs = docs.slice(ids.length);
      const lines = items.map((it) => {
        const idx = ids.indexOf(it.productId);
        const p = prods[idx];
        if (!p) throw new BusinessError('Producto no encontrado.');
        const v = (p.variants || []).find((x) => String(x.size) === it.size);
        if (!v || (Number(v.stock) || 0) < it.quantity) throw new BusinessError(`No hay stock de "${p.name}" en talla ${it.size}.`);
        return { productId: p.id, productName: p.name, sku: p.sku || '', image: p.images?.[0] || '', size: it.size, quantity: it.quantity, unitPrice: Number(p.salePrice), unitCost: Number(privs[idx]?.costPrice) || 0, total: Math.round(Number(p.salePrice) * it.quantity * 100) / 100 };
      });
      await adjustStock(tx, lines, 'deduct');
      const number = (Number(counters?.orders) || 0) + 1;
      const id = `PED-${new Date().getFullYear()}-${pad4(number)}`;
      const subtotal = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
      const shippingCost = SITE_CONFIG.shipping.methods[shippingMethod]?.cost ?? 0;
      const digits = phoneDigits(client.phone);
      const clientId = digits ? `cli-${digits.replace(/^34/, '')}` : `cli-${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      tx.set('meta', 'counters', { orders: number }, true);
      tx.set('orders', id, {
        id, number, source: 'panel', clientId, clientName: client.name, clientPhone: client.phone || '', clientEmail: client.email || '',
        clientAddress: shippingMethod === 'delivery' ? client.address || '' : 'Entrega en persona (Málaga)',
        shippingMethod, shippingLabel: SITE_CONFIG.shipping.methods[shippingMethod]?.label || '', paymentMethod, shippingCost, subtotal,
        total: Math.round((subtotal + shippingCost) * 100) / 100,
        paymentStatus: paymentMethod === 'paypal' || status === 'Entregado' ? 'paid' : 'pending',
        items: lines, status, notes: notes || '', createdAt: now, invoiceGenerated: false,
      });
      tx.set('clients', clientId, { id: clientId, name: client.name, phone: client.phone || '', email: client.email || '', address: client.address || '', clientType: 'Cliente', createdAt: todayISO() }, true);
      return id;
    }), [backend]);

  /* ----------------------------- Clientes ---------------------------- */
  const saveClient = useCallback(async (c) => {
    const id = c.id || `cli-${phoneDigits(c.phone).replace(/^34/, '') || Date.now().toString(36)}`;
    await backend.set('clients', id, { ...c, id: undefined, createdAt: c.createdAt || todayISO() }, true);
    return id;
  }, [backend]);
  const deleteClient = useCallback((id) => backend.del('clients', id), [backend]);

  /* ----------------------------- Facturas ---------------------------- */
  const createInvoice = useCallback((orderId) =>
    backend.transact(async (tx) => {
      const [o, counters, biz] = await Promise.all([tx.get('orders', orderId), tx.get('meta', 'counters'), tx.get('settings', 'business')]);
      if (!o) throw new BusinessError('Pedido no encontrado.');
      if (o.invoiceId) return o.invoiceId;
      const number = (Number(counters?.invoices) || 0) + 1;
      const id = `${SITE_CONFIG.invoices.prefix}-${new Date().getFullYear()}-${pad4(number)}`;
      tx.set('meta', 'counters', { invoices: number }, true);
      tx.set('invoices', id, {
        id, orderId, date: todayISO(),
        client: { name: o.clientName, address: o.clientAddress, phone: o.clientPhone, email: o.clientEmail },
        items: o.items.map((l) => ({ name: l.productName, size: l.size, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
        subtotal: o.subtotal, shippingCost: o.shippingCost, total: o.total,
        status: o.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente', business: biz || {},
      });
      tx.set('orders', orderId, { invoiceGenerated: true, invoiceId: id }, true);
      return id;
    }), [backend]);
  const setInvoiceStatus = useCallback((id, status) => backend.set('invoices', id, { status }, true), [backend]);

  /* ------------------------ Ajustes y plantillas --------------------- */
  const saveBusiness = useCallback((data) => backend.set('settings', 'business', data, true), [backend]);
  const saveTemplate = useCallback((key, text) => backend.set('templates', key, { text }, false), [backend]);
  const resetTemplate = useCallback((key) => backend.del('templates', key), [backend]);

  const value = {
    backend, ready, errors, products, orders, clients, invoices, stats, business, templates,
    actions: { saveProduct, deleteProduct, setActive, setStock, deleteDemoProducts, setOrderStatus, markPaid, saveOrderNotes, saveOrderTracking, notifyOrderEmail, createManualOrder, saveClient, deleteClient, createInvoice, setInvoiceStatus, saveBusiness, saveTemplate, resetTemplate },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
