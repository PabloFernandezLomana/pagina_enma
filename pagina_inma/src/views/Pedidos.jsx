// pagina_inma/src/views/Pedidos.jsx
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Phone, MessageCircle, Check, FileText, Plus, X, MapPin } from 'lucide-react';
import { useData, BusinessError } from '../lib/data';
import { eur, fmtDateTime, timeAgo, whatsappUrl, STATUSES, totalStock } from '../lib/format';
import { fillTemplate, TEMPLATE_LABELS } from '../lib/templates';
import { downloadInvoicePdf } from '../lib/invoicePdf';
import { SITE_CONFIG } from '../site.config';
import { Sheet, SheetBody, Field, Empty, useConfirm } from '../components/ui';

export const paymentBadge = (o) => {
  const { paymentMethod: m, paymentStatus: s } = o;
  if (s === 'awaiting_payment') return ['PayPal · sin pagar', 'b-warn'];
  if (s === 'refunded') return ['Reembolsado', 'b-bad'];
  if (s === 'failed' || s === 'cancelled') return ['Pago cancelado', 'b-bad'];
  if (m === 'paypal') return ['PayPal · pagado', 'b-ok'];
  return s === 'paid' ? ['Cobrado en mano', 'b-ok'] : ['Cobrar en mano', 'b-warn'];
};
const statusBadge = { Pendiente: 'b-pink', Preparando: 'b-blue', Enviado: 'b-blue', Entregado: 'b-ok', Cancelado: 'b-bad' };
const NEXT = { Pendiente: ['Preparando', 'Empezar a prepararlo'], Preparando: ['Enviado', 'Marcar como enviado'], Enviado: ['Entregado', 'Marcar como entregado'] };

function OrderSheet({ orderId, onClose }) {
  const { orders, templates, business, actions } = useData();
  const confirm = useConfirm();
  const order = orders.find((o) => o.id === orderId);
  const [tplKey, setTplKey] = useState(null);
  const [msg, setMsg] = useState('');
  const [notes, setNotes] = useState(order?.notes || '');
  const [busy, setBusy] = useState(false);

  const key = tplKey || (order && (STATUSES.includes(order.status) ? order.status : 'Pendiente'));
  useEffect(() => { if (order && key) setMsg(fillTemplate(templates[key] || '', order)); }, [key, order?.status, order?.id, templates]); // eslint-disable-line
  if (!order) return null;

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); if (okMsg) toast.success(okMsg); }
    catch (err) { toast.error(err instanceof BusinessError ? err.message : 'No se pudo completar. Inténtalo otra vez.'); }
    finally { setBusy(false); }
  };

  const next = NEXT[order.status];
  const flow = ['Pendiente', 'Preparando', 'Enviado', 'Entregado'];
  const idx = flow.indexOf(order.status);
  const [payLabel, payCls] = paymentBadge(order);

  const cancel = async () => {
    const warn = order.paymentMethod === 'paypal' && order.paymentStatus === 'paid' ? ' Ya está pagado por PayPal: recuerda devolver el dinero desde tu cuenta de PayPal.' : '';
    if (!(await confirm({ title: '¿Cancelar este pedido?', text: `El stock vuelve a la tienda.${warn}`, ok: 'Sí, cancelar', cancel: 'No', danger: true }))) return;
    run(() => actions.setOrderStatus(order.id, 'Cancelado'), 'Pedido cancelado');
  };
  const invoice = async () => {
    setBusy(true);
    try {
      const id = order.invoiceId || (await actions.createInvoice(order.id));
      toast.success(order.invoiceId ? 'Descargando factura…' : `Factura ${id} creada`);
      await downloadInvoicePdf(await buildInvoice(id));
    } catch (e) { console.error(e); toast.error('No se pudo crear la factura'); } finally { setBusy(false); }
  };
  const buildInvoice = async (id) => ({
    id, orderId: order.id, date: new Date().toLocaleDateString('sv-SE'), client: { name: order.clientName, address: order.clientAddress, phone: order.clientPhone },
    items: order.items.map((l) => ({ name: l.productName, size: l.size, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
    shippingCost: order.shippingCost, total: order.total, status: order.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente', business,
  });

  return (
    <Sheet title={`Pedido ${order.id}`} onClose={onClose} wide>
      <SheetBody>
        <div className="row wrap"><span className={`badge ${statusBadge[order.status]}`}>{order.status}</span><span className={`badge ${payCls}`}>{payLabel}</span><span className="badge">{order.source === 'web' ? '🌐 Web' : '✍️ Venta manual'}</span><span className="muted small">{fmtDateTime(order.createdAt)}</span></div>

        {order.paymentStatus === 'awaiting_payment' && <div className="alert">El cliente empezó a pagar con PayPal pero no ha terminado. El stock está reservado; si pasa mucho rato, cancela el pedido para liberarlo.</div>}

        {order.status !== 'Cancelado' && (
          <div className="stack">
            <div className="status-flow">{flow.map((s, i) => <div key={s} className={i <= idx ? 'on' : ''}>{s}</div>)}</div>
            {next && <button className="btn btn-dark btn-lg btn-block" disabled={busy} onClick={() => run(() => actions.setOrderStatus(order.id, next[0]), `Ahora está: ${next[0]}`)}><Check aria-hidden />{next[1]}</button>}
            {order.paymentMethod === 'cash' && order.paymentStatus === 'pending' && <button className="btn btn-ok btn-block" disabled={busy} onClick={() => run(() => actions.markPaid(order.id), 'Cobro registrado')}>💶 Ya me han pagado {eur(order.total)}</button>}
          </div>
        )}

        {order.clientPhone && (
          <section className="wa-box">
            <div className="row between wrap"><b><MessageCircle size={16} style={{ verticalAlign: '-3px' }} aria-hidden /> Avisar por WhatsApp</b>
              <select className="select" style={{ width: 'auto', minHeight: 40 }} value={key} onChange={(e) => setTplKey(e.target.value)} aria-label="Mensaje">{Object.keys(TEMPLATE_LABELS).map((k) => <option key={k} value={k}>{TEMPLATE_LABELS[k]}</option>)}</select>
            </div>
            <textarea className="textarea" value={msg} onChange={(e) => setMsg(e.target.value)} aria-label="Texto del mensaje" />
            <a className="btn btn-wa btn-block" href={whatsappUrl(order.clientPhone, msg)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Abrir WhatsApp con este mensaje</a>
            <p className="hint">No se envía nada solo: tú revisas el texto y pulsas enviar en WhatsApp.</p>
          </section>
        )}

        <section className="card" style={{ boxShadow: 'none', border: '1px solid rgb(var(--p-ink) / .08)' }}>
          <h2 style={{ marginBottom: 8 }}>{order.clientName}</h2>
          <div className="stack" style={{ gap: 6 }}>
            {order.clientPhone && <a href={`tel:${order.clientPhone}`} className="row"><Phone size={16} aria-hidden />{order.clientPhone}</a>}
            {order.clientEmail && <span className="muted small">{order.clientEmail}</span>}
            <span className="row" style={{ alignItems: 'flex-start' }}><MapPin size={16} style={{ marginTop: 3, flex: 'none' }} aria-hidden /><span>{order.shippingLabel || ''}{order.shippingMethod === 'delivery' ? ` · ${order.clientAddress}` : ''}</span></span>
          </div>
        </section>

        <section>
          {order.items.map((l, i) => (
            <div className="line" key={i}>
              {l.image ? <img className="thumb thumb-sm" src={l.image} alt="" /> : <span className="thumb thumb-sm" />}
              <div style={{ flex: 1, minWidth: 0 }}><b style={{ display: 'block' }}>{l.productName}</b><span className="muted small">Talla {l.size} · {l.quantity} × {eur(l.unitPrice)}</span></div>
              <b className="num">{eur(l.total)}</b>
            </div>
          ))}
          <div className="totals"><div><span className="muted">Productos</span><span className="num">{eur(order.subtotal)}</span></div><div><span className="muted">Envío</span><span className="num">{order.shippingCost ? eur(order.shippingCost) : 'Gratis'}</span></div><div className="big"><span>Total</span><span className="num">{eur(order.total)}</span></div></div>
        </section>

        <Field label="Notas (solo las ves tú)"><textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (order.notes || '') && actions.saveOrderNotes(order.id, notes)} /></Field>

        <div className="row wrap">
          <button className="btn" disabled={busy} onClick={invoice}><FileText aria-hidden />{order.invoiceId ? `Descargar factura ${order.invoiceId}` : 'Crear factura'}</button>
          {order.status !== 'Cancelado' && order.status !== 'Entregado' && <button className="btn btn-danger" disabled={busy} onClick={cancel}>Cancelar pedido</button>}
          {order.status === 'Cancelado' && <button className="btn" disabled={busy} onClick={() => run(() => actions.setOrderStatus(order.id, 'Pendiente'), 'Pedido recuperado')}>Recuperar pedido</button>}
        </div>
      </SheetBody>
    </Sheet>
  );
}

function NewSaleSheet({ onClose, onCreated }) {
  const { products, clients, actions } = useData();
  const [client, setClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [lines, setLines] = useState([]);
  const [pid, setPid] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [shipping, setShipping] = useState('meetup');
  const [payment, setPayment] = useState('cash');
  const [status, setStatus] = useState('Entregado');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const active = products.filter((p) => p.active !== false && totalStock(p) > 0);
  const prod = products.find((p) => p.id === pid);
  const sizes = (prod?.variants || []).filter((v) => v.stock > 0);
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipCost = SITE_CONFIG.shipping.methods[shipping]?.cost || 0;

  const addLine = () => {
    if (!prod || !size) return;
    const v = prod.variants.find((x) => x.size === size);
    const already = lines.filter((l) => l.productId === pid && l.size === size).reduce((s, l) => s + l.quantity, 0);
    if (already + qty > v.stock) return toast.info(`Solo quedan ${v.stock} de esa talla`);
    setLines([...lines, { productId: pid, size, quantity: qty, name: prod.name, price: prod.salePrice, image: prod.images?.[0] }]);
    setPid(''); setSize(''); setQty(1);
  };
  const pickClient = (id) => { const c = clients.find((x) => x.id === id); if (c) setClient({ name: c.name || '', phone: c.phone || '', email: c.email || '', address: c.address || '' }); };

  const save = async () => {
    if (!client.name.trim()) return toast.info('Pon el nombre del cliente');
    if (shipping === 'delivery' && !client.address.trim()) return toast.info('Falta la dirección de envío');
    setBusy(true);
    try {
      const id = await actions.createManualOrder({ client: { ...client, name: client.name.trim() }, items: lines.map(({ productId, size: s, quantity }) => ({ productId, size: s, quantity })), shippingMethod: shipping, paymentMethod: payment, status, notes });
      toast.success(`Venta ${id} guardada y stock descontado`); onCreated(id);
    } catch (err) { toast.error(err instanceof BusinessError ? err.message : 'No se pudo guardar'); setBusy(false); }
  };

  return (
    <Sheet title="Nueva venta" onClose={onClose} wide footer={<button className="btn btn-primary btn-lg" disabled={busy || !lines.length} onClick={save}>{busy ? 'Guardando…' : `Guardar venta · ${eur(subtotal + shipCost)}`}</button>}>
      <SheetBody>
        <p className="muted">Para ventas en persona o por WhatsApp. Descuenta el stock solo.</p>
        <div className="stack">
          <h2>1 · Cliente</h2>
          {clients.length > 0 && <Field label="Elegir un cliente que ya tienes"><select className="select" defaultValue="" onChange={(e) => pickClient(e.target.value)}><option value="">— Cliente nuevo —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
          <div className="grid-2 stack"><Field label="Nombre"><input className="input" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /></Field><Field label="Teléfono"><input className="input" inputMode="tel" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></Field></div>
        </div>
        <div className="stack">
          <h2>2 · Productos</h2>
          {lines.map((l, i) => (
            <div className="line" key={i}>{l.image && <img className="thumb thumb-sm" src={l.image} alt="" />}<div style={{ flex: 1 }}><b>{l.name}</b><br /><span className="muted small">Talla {l.size} · {l.quantity} ud.</span></div><b className="num">{eur(l.price * l.quantity)}</b><button className="icon-btn" onClick={() => setLines(lines.filter((_, k) => k !== i))} aria-label="Quitar"><X /></button></div>
          ))}
          <div className="grid-2 stack">
            <Field label="Producto"><select className="select" value={pid} onChange={(e) => { setPid(e.target.value); setSize(''); }}><option value="">Elige…</option>{active.map((p) => <option key={p.id} value={p.id}>{p.name} · {eur(p.salePrice)}</option>)}</select></Field>
            <Field label="Talla"><select className="select" value={size} onChange={(e) => setSize(e.target.value)} disabled={!prod}><option value="">Elige…</option>{sizes.map((v) => <option key={v.size} value={v.size}>{v.size} ({v.stock})</option>)}</select></Field>
          </div>
          <div className="row"><div className="stepper" style={{ margin: 0 }}><button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos">−</button><input readOnly value={qty} aria-label="Cantidad" /><button type="button" onClick={() => setQty(qty + 1)} aria-label="Más">+</button></div><button className="btn" disabled={!prod || !size} onClick={addLine}><Plus aria-hidden />Añadir a la venta</button></div>
        </div>
        <div className="stack">
          <h2>3 · Entrega y pago</h2>
          <div className="chips">{Object.entries(SITE_CONFIG.shipping.methods).map(([k, m]) => <button key={k} className="chip" aria-pressed={shipping === k} onClick={() => { setShipping(k); if (k === 'delivery') setPayment('paypal'); }}>{m.label}</button>)}</div>
          {shipping === 'delivery' && <Field label="Dirección de envío"><input className="input" value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} /></Field>}
          <div className="chips"><button className="chip" aria-pressed={payment === 'cash'} onClick={() => setPayment('cash')}>💶 En mano</button><button className="chip" aria-pressed={payment === 'paypal'} onClick={() => setPayment('paypal')}>PayPal (ya pagado)</button></div>
          <div className="chips">{['Entregado', 'Pendiente'].map((s) => <button key={s} className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s === 'Entregado' ? 'Ya entregado' : 'Aún por entregar'}</button>)}</div>
          <Field label="Notas"><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </div>
      </SheetBody>
    </Sheet>
  );
}

export default function Pedidos({ intent, clearIntent }) {
  const { orders } = useData();
  const [tab, setTab] = useState('atender');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!intent) return;
    if (intent.new) setCreating(true);
    if (intent.open) setOpen(intent.open);
    clearIntent();
  }, [intent]); // eslint-disable-line

  const tabs = [['atender', 'Por atender', (o) => o.status === 'Pendiente' || o.status === 'Preparando'], ['enviados', 'Enviados', (o) => o.status === 'Enviado'], ['entregados', 'Entregados', (o) => o.status === 'Entregado'], ['cancelados', 'Cancelados', (o) => o.status === 'Cancelado'], ['todos', 'Todos', () => true]];
  const list = useMemo(() => {
    const f = tabs.find((t) => t[0] === tab)[2];
    const t = q.trim().toLowerCase();
    return orders.filter(f).filter((o) => !t || `${o.id} ${o.clientName} ${o.clientPhone}`.toLowerCase().includes(t));
  }, [orders, tab, q]); // eslint-disable-line

  return (
    <div className="stack-lg">
      <div className="page-head"><div><h1>Pedidos</h1><p>Toca un pedido para ver el detalle, avisar al cliente o cambiar su estado.</p></div><div className="actions"><button className="btn btn-primary btn-lg" onClick={() => setCreating(true)}><Plus aria-hidden />Nueva venta</button></div></div>
      <div className="stack">
        <div className="search"><Search aria-hidden /><input className="input" placeholder="Buscar por cliente, teléfono o nº de pedido" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar pedidos" /></div>
        <div className="scroll-x">{tabs.map(([id, l, f]) => <button key={id} className="chip" aria-pressed={tab === id} onClick={() => setTab(id)}>{l} <span className="muted num">{orders.filter(f).length}</span></button>)}</div>
      </div>
      {list.length === 0 ? <Empty emoji="📦" title="No hay pedidos aquí" text={tab === 'atender' ? '¡Todo al día!' : 'Cuando haya, aparecerán en esta lista.'} /> : (
        <div className="list">{list.map((o, i) => { const [pl, pc] = paymentBadge(o); return (
          <button key={o.id} className="item rise" style={{ '--i': Math.min(i, 8) }} onClick={() => setOpen(o.id)}>
            <span className="avatar">{(o.clientName || '?')[0].toUpperCase()}</span>
            <span className="grow"><span className="title" style={{ display: 'block' }}>{o.clientName}</span><span className="muted small">{o.id} · {(() => { const n = o.items.reduce((s, l) => s + l.quantity, 0); return `${n} ${n === 1 ? 'prenda' : 'prendas'}`; })()} · {timeAgo(o.createdAt)}</span><span className="row wrap" style={{ gap: 6, marginTop: 6 }}><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span><span className={`badge ${pc}`}>{pl}</span></span></span>
            <b className="num">{eur(o.total)}</b>
          </button>); })}</div>
      )}
      {open && <OrderSheet orderId={open} onClose={() => setOpen(null)} />}
      {creating && <NewSaleSheet onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpen(id); }} />}
    </div>
  );
}
