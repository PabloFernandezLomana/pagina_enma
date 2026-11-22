// pagina_inma/src/views/Ajustes.jsx
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { useData } from '../lib/data';
import { IS_DEMO } from '../lib/backend';
import { DEFAULT_TEMPLATES, TEMPLATE_LABELS } from '../lib/templates';
import { Field, useConfirm } from '../components/ui';

export default function Ajustes({ onSignOut }) {
  const { business, templates, products, actions, backend } = useData();
  const confirm = useConfirm();
  const [biz, setBiz] = useState({ name: '', legalName: '', nif: '', address: '', phone: '', email: '' });
  const [tpl, setTpl] = useState(templates);
  useEffect(() => setBiz((b) => ({ ...b, ...business })), [business]);
  useEffect(() => setTpl(templates), [templates]);
  const demoCount = products.filter((p) => p.demo).length;

  const saveBiz = async () => { await actions.saveBusiness(biz); toast.success('Datos guardados'); };
  const saveTpl = async (k) => { await actions.saveTemplate(k, tpl[k]); toast.success('Mensaje guardado'); };
  const resetTpl = async (k) => { await actions.resetTemplate(k); toast.success('Mensaje restaurado'); };
  const purge = async () => {
    if (!(await confirm({ title: `¿Borrar ${demoCount} productos de prueba?`, text: 'Solo se borran los marcados como "Prueba". Tus productos reales no se tocan.', ok: 'Borrar', danger: true }))) return;
    const n = await actions.deleteDemoProducts(); toast.success(`${n} productos de prueba borrados`);
  };

  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      <div className="page-head"><div><h1>Ajustes</h1><p>Datos para las facturas y mensajes de WhatsApp.</p></div></div>

      <section className="card stack">
        <h2>Datos del negocio (salen en las facturas)</h2>
        <div className="grid-2 stack">
          <Field label="Nombre comercial"><input className="input" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} placeholder="ModaEnma" /></Field>
          <Field label="Nombre y apellidos o razón social"><input className="input" value={biz.legalName} onChange={(e) => setBiz({ ...biz, legalName: e.target.value })} /></Field>
          <Field label="NIF / DNI"><input className="input" value={biz.nif} onChange={(e) => setBiz({ ...biz, nif: e.target.value })} /></Field>
          <Field label="Teléfono"><input className="input" inputMode="tel" value={biz.phone} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} /></Field>
        </div>
        <Field label="Dirección"><input className="input" value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} /></Field>
        <Field label="Correo"><input className="input" type="email" value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} /></Field>
        <button className="btn btn-primary" onClick={saveBiz}>Guardar datos</button>
        <p className="hint">Para vender de forma habitual hace falta darse de alta como autónomo/a. Consúltalo con tu gestor.</p>
      </section>

      <section className="card stack">
        <h2>Mensajes de WhatsApp</h2>
        <p className="hint">Puedes usar {'{nombre}'}, {'{pedido}'} y {'{total}'}. Se rellenan solos.</p>
        {Object.keys(DEFAULT_TEMPLATES).map((k) => (
          <div className="stack" key={k} style={{ gap: 8 }}>
            <Field label={TEMPLATE_LABELS[k]}><textarea className="textarea" value={tpl[k] || ''} onChange={(e) => setTpl({ ...tpl, [k]: e.target.value })} /></Field>
            <div className="row"><button className="btn btn-sm" disabled={tpl[k] === templates[k]} onClick={() => saveTpl(k)}>Guardar</button><button className="btn btn-sm btn-ghost" onClick={() => resetTpl(k)}>Restaurar</button></div>
          </div>
        ))}
      </section>

      {demoCount > 0 && (
        <section className="card stack"><h2>Productos de prueba</h2><p className="muted">Hay {demoCount} productos de ejemplo cargados para que puedas probar la tienda. Bórralos cuando subas los tuyos.</p><button className="btn btn-danger" onClick={purge}>Borrar productos de prueba</button></section>
      )}

      {IS_DEMO && <section className="card stack"><h2>Modo prueba</h2><p className="muted">Estás usando datos de ejemplo guardados solo en este navegador.</p><button className="btn" onClick={() => { backend.reset(); toast.success('Datos de prueba restaurados'); }}>Restaurar datos de prueba</button></section>}

      <button className="btn" onClick={onSignOut}><LogOut aria-hidden />Cerrar sesión</button>
    </div>
  );
}
