// pagina_inma/src/views/Facturas.jsx
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, FilePlus } from 'lucide-react';
import { useData } from '../lib/data';
import { eur, fmtDate } from '../lib/format';
import { downloadInvoicePdf } from '../lib/invoicePdf';
import { Empty } from '../components/ui';

export default function Facturas() {
  const { invoices, orders, business, actions } = useData();
  const [busy, setBusy] = useState(null);
  const pending = useMemo(() => orders.filter((o) => !o.invoiceId && o.status !== 'Cancelado' && o.paymentStatus !== 'awaiting_payment'), [orders]);

  const create = async (o) => {
    setBusy(o.id);
    try { const id = await actions.createInvoice(o.id); toast.success(`Factura ${id} creada`); } catch { toast.error('No se pudo crear la factura'); } finally { setBusy(null); }
  };
  const download = (inv) => downloadInvoicePdf(inv, business).catch(() => toast.error('No se pudo generar el PDF'));

  return (
    <div className="stack-lg">
      <div className="page-head"><div><h1>Facturas</h1><p>PDF listo para enviar. Los precios ya llevan el IVA incluido, así que no se desglosa.</p></div></div>
      {!business.nif && !business.legalName && <div className="alert">Tus facturas saldrán sin tus datos fiscales (nombre y NIF). Rellénalos en <b>Ajustes → Datos del negocio</b> antes de enviar la primera.</div>}

      {pending.length > 0 && (
        <section className="card"><div className="card-head"><h2>Pedidos sin factura</h2><span className="muted small">{pending.length}</span></div>
          <div className="list">{pending.slice(0, 8).map((o) => (
            <div className="item" key={o.id}><span className="grow"><span className="title" style={{ display: 'block' }}>{o.clientName}</span><span className="muted small">{o.id} · {fmtDate(o.createdAt)} · {eur(o.total)}</span></span><button className="btn btn-sm" disabled={busy === o.id} onClick={() => create(o)}><FilePlus aria-hidden />Crear</button></div>
          ))}</div>
        </section>
      )}

      {invoices.length === 0 ? <Empty emoji="🧾" title="Aún no hay facturas" text="Créalas desde un pedido o desde la lista de arriba." /> : (
        <div className="list">{invoices.map((inv) => (
          <div className="item" key={inv.id}>
            <span className="grow"><span className="title" style={{ display: 'block' }}>{inv.id} · {inv.client?.name}</span><span className="muted small">{fmtDate(inv.date)} · {inv.orderId}</span></span>
            <span style={{ textAlign: 'right' }}><b className="num">{eur(inv.total)}</b><br /><button className={`badge ${inv.status === 'Pagada' ? 'b-ok' : 'b-warn'}`} onClick={() => actions.setInvoiceStatus(inv.id, inv.status === 'Pagada' ? 'Pendiente' : 'Pagada')} title="Cambiar estado">{inv.status}</button></span>
            <button className="icon-btn" onClick={() => download(inv)} aria-label={`Descargar ${inv.id}`}><Download /></button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
