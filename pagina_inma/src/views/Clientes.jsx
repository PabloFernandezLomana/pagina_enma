// pagina_inma/src/views/Clientes.jsx
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Phone, MessageCircle, Contact, Trash2 } from 'lucide-react';
import { useData } from '../lib/data';
import { eur, phoneDigits, whatsappUrl, timeAgo } from '../lib/format';
import { countsAsSale } from '../lib/stats';
import { Sheet, SheetBody, Field, Empty, useConfirm } from '../components/ui';

const canPickContacts = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

function ClientSheet({ client, orders, onClose }) {
  const { actions } = useData();
  const confirm = useConfirm();
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', notes: '', ...client });
  const [busy, setBusy] = useState(false);
  const isNew = !client?.id;

  const pick = async () => {
    try {
      const [c] = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: false });
      if (!c) return;
      setF((x) => ({ ...x, name: c.name?.[0] || x.name, phone: c.tel?.[0] || x.phone, email: c.email?.[0] || x.email }));
    } catch { toast.error('No se pudo abrir la agenda'); }
  };
  const save = async () => {
    if (!f.name.trim()) return toast.info('Pon un nombre');
    setBusy(true);
    try { await actions.saveClient({ ...f, name: f.name.trim() }); toast.success('Cliente guardado'); onClose(); } catch { toast.error('No se pudo guardar'); setBusy(false); }
  };
  const remove = async () => {
    if (!(await confirm({ title: `¿Borrar a ${client.name}?`, text: 'Sus pedidos se mantienen.', ok: 'Borrar', danger: true }))) return;
    await actions.deleteClient(client.id); toast.success('Cliente borrado'); onClose();
  };

  return (
    <Sheet title={isNew ? 'Nuevo cliente' : f.name || 'Cliente'} onClose={onClose} footer={<button className="btn btn-primary" disabled={busy} onClick={save}>Guardar</button>}>
      <SheetBody>
        {isNew && (canPickContacts
          ? <button className="btn btn-block" onClick={pick}><Contact aria-hidden />Elegir de la agenda del móvil</button>
          : <p className="hint">Desde el móvil (Chrome en Android) podrás elegir al cliente de tu agenda con un toque.</p>)}
        <Field label="Nombre"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Teléfono"><input className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Correo"><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Dirección"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="Notas" hint="Tallas, gustos, cumpleaños…"><textarea className="textarea" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        {!isNew && f.phone && <div className="row wrap"><a className="btn" href={`tel:${f.phone}`}><Phone aria-hidden />Llamar</a><a className="btn btn-wa" href={whatsappUrl(f.phone, `Hola ${f.name.split(' ')[0]} 🌸`)} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden />WhatsApp</a></div>}
        {!isNew && orders.length > 0 && (
          <section><h2 style={{ marginBottom: 6 }}>Sus pedidos</h2>{orders.map((o) => <div className="line" key={o.id}><div style={{ flex: 1 }}><b>{o.id}</b><br /><span className="muted small">{timeAgo(o.createdAt)} · {o.status}</span></div><b className="num">{eur(o.total)}</b></div>)}</section>
        )}
        {!isNew && <button className="btn btn-danger" onClick={remove}><Trash2 aria-hidden />Borrar cliente</button>}
      </SheetBody>
    </Sheet>
  );
}

export default function Clientes({ intent, clearIntent }) {
  const { clients, orders } = useData();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { if (intent?.new) { setEditing({}); clearIntent(); } }, [intent]); // eslint-disable-line

  const enriched = useMemo(() => clients.map((c) => {
    const d = phoneDigits(c.phone);
    const mine = orders.filter((o) => o.clientId === c.id || (d && phoneDigits(o.clientPhone) === d));
    const paid = mine.filter(countsAsSale);
    return { ...c, orders: mine, spent: paid.reduce((s, o) => s + o.total, 0), count: paid.length };
  }), [clients, orders]);
  const list = enriched.filter((c) => { const t = q.trim().toLowerCase(); return !t || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(t); });

  return (
    <div className="stack-lg">
      <div className="page-head"><div><h1>Clientes</h1><p>{clients.length} personas. Los que compran en la web aparecen solos.</p></div><div className="actions"><button className="btn btn-primary btn-lg" onClick={() => setEditing({})}><Plus aria-hidden />Nuevo cliente</button></div></div>
      <div className="search"><Search aria-hidden /><input className="input" placeholder="Buscar por nombre o teléfono" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar clientes" /></div>
      {list.length === 0 ? <Empty emoji="💌" title="Aún no hay clientes" text="Añádelos tú o espera a la primera compra online." /> : (
        <div className="list">{list.map((c, i) => (
          <button key={c.id} className="item rise" style={{ '--i': Math.min(i, 8) }} onClick={() => setEditing(c)}>
            <span className="avatar">{(c.name || '?')[0].toUpperCase()}</span>
            <span className="grow"><span className="title" style={{ display: 'block' }}>{c.name}</span><span className="muted small">{c.phone || 'Sin teléfono'}</span></span>
            <span style={{ textAlign: 'right' }}><b className="num">{eur(c.spent)}</b><br /><span className="muted small">{c.count} {c.count === 1 ? 'compra' : 'compras'}</span></span>
          </button>
        ))}</div>
      )}
      {editing && <ClientSheet client={editing.id ? editing : null} orders={editing.id ? enriched.find((c) => c.id === editing.id)?.orders || [] : []} onClose={() => setEditing(null)} />}
    </div>
  );
}
