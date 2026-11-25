// pagina_inma/src/App.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster } from 'sonner';
import { Home, ShoppingBag, Shirt, Users, FileText, Settings, Menu, LogOut } from 'lucide-react';
import { getBackend, IS_DEMO } from './lib/backend';
import { DataProvider, useData } from './lib/data';
import { ConfirmProvider } from './components/ui';
import Login from './components/Login';
import Inicio from './views/Inicio';
import Productos from './views/Productos';
import Pedidos from './views/Pedidos';
import Clientes from './views/Clientes';
import Facturas from './views/Facturas';
import Ajustes from './views/Ajustes';

const VIEWS = {
  inicio: { label: 'Inicio', icon: Home },
  pedidos: { label: 'Pedidos', icon: ShoppingBag },
  productos: { label: 'Productos', icon: Shirt },
  clientes: { label: 'Clientes', icon: Users },
  facturas: { label: 'Facturas', icon: FileText },
  ajustes: { label: 'Ajustes', icon: Settings },
  mas: { label: 'Más', icon: Menu },
};
const SIDEBAR = ['inicio', 'pedidos', 'productos', 'clientes', 'facturas', 'ajustes'];
const TABBAR = ['inicio', 'pedidos', 'productos', 'clientes', 'mas'];

const parseHash = () => (window.location.hash.replace('#/', '') || 'inicio').split('?')[0];

function Shell({ user, onSignOut }) {
  const { orders, ready, errors } = useData();
  const [view, setView] = useState(parseHash());
  const [intent, setIntent] = useState(null);

  useEffect(() => {
    const onHash = () => setView(VIEWS[parseHash()] ? parseHash() : 'inicio');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((v, nextIntent = null) => {
    setIntent(nextIntent);
    window.location.hash = `#/${v}`;
    window.scrollTo({ top: 0 });
  }, []);

  const pending = useMemo(() => orders.filter((o) => o.status === 'Pendiente' || o.status === 'Preparando').length, [orders]);
  const permissionProblem = Object.values(errors).some((e) => String(e).includes('permission'));

  const nav = (id, cls) => {
    const { icon: Icon, label } = VIEWS[id];
    return (
      <button key={id} className={cls} aria-current={view === id || (id === 'mas' && ['facturas', 'ajustes', 'mas'].includes(view)) ? 'page' : undefined} onClick={() => go(id)}>
        <Icon aria-hidden />
        <span>{label}</span>
        {id === 'pedidos' && pending > 0 && <span className="badge-dot" aria-label={`${pending} por atender`}>{pending}</span>}
      </button>
    );
  };

  const props = { go, intent, clearIntent: () => setIntent(null) };
  return (
    <div className="app">
      <aside className="sidebar" aria-label="Menú principal">
        <div className="brand">Moda<b>Enma</b></div>
        {SIDEBAR.map((id) => nav(id, 'nav'))}
        <div className="sidebar-foot">
          {IS_DEMO && <span className="badge b-warn">Modo prueba</span>}
          <span className="small muted" style={{ padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
          <button className="nav" onClick={onSignOut}><LogOut aria-hidden /><span>Cerrar sesión</span></button>
        </div>
      </aside>

      <main className="main" id="main">
        {permissionProblem && (
          <div className="alert bad" style={{ marginBottom: 16 }}>
            <b>Esta cuenta no tiene permiso de administrador.</b> Ejecuta <code>npm run set-admin -- tu@correo.com</code> en la carpeta de la tienda, cierra sesión y vuelve a entrar.
          </div>
        )}
        {!ready ? (
          <div className="empty"><div className="big" aria-hidden>🌸</div><p className="muted">Cargando tu tienda…</p></div>
        ) : (
          <>
            {view === 'inicio' && <Inicio {...props} />}
            {view === 'pedidos' && <Pedidos {...props} />}
            {view === 'productos' && <Productos {...props} />}
            {view === 'clientes' && <Clientes {...props} />}
            {view === 'facturas' && <Facturas {...props} />}
            {view === 'ajustes' && <Ajustes {...props} onSignOut={onSignOut} />}
            {view === 'mas' && (
              <div className="stack">
                <div className="page-head"><div><h1>Más cosas</h1></div></div>
                <div className="list">
                  {['facturas', 'ajustes'].map((id) => { const { icon: Icon, label } = VIEWS[id]; return (
                    <button key={id} className="item" onClick={() => go(id)}><span className="avatar"><Icon aria-hidden /></span><span className="grow title">{label}</span></button>
                  ); })}
                  <button className="item" onClick={onSignOut}><span className="avatar"><LogOut aria-hidden /></span><span className="grow title">Cerrar sesión</span></button>
                </div>
              </div>
            )}
          </>
        )}
      </main>


      <nav className="tabbar" aria-label="Menú">{TABBAR.map((id) => nav(id, 'tab'))}</nav>
    </div>
  );
}

function NoAccess({ user, backend, onUser }) {
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    try { const u = await backend.auth.refreshClaims(); if (u) onUser(u); } catch { /* sin conexión */ }
    setBusy(false);
  };
  return (
    <div className="login"><div className="login-card">
      <div className="brand">Moda<b>Enma</b></div>
      <h1>Esta cuenta aún no tiene acceso</h1>
      <p className="muted">Has entrado como <b>{user.email}</b>, pero esta cuenta no tiene permiso de administrador. Pide que se lo den y pulsa «Comprobar de nuevo»: no hace falta volver a escribir la contraseña.</p>
      <button className="btn btn-primary btn-block" disabled={busy} onClick={retry}>{busy ? 'Comprobando…' : 'Comprobar de nuevo'}</button>
      <button className="btn btn-ghost btn-block" onClick={() => backend.auth.signOut()}>Cerrar sesión</button>
    </div></div>
  );
}

export default function App() {
  const backend = useMemo(() => getBackend(), []);
  const [user, setUser] = useState(undefined);

  useEffect(() => (backend ? backend.auth.onChange(setUser) : undefined), [backend]);

  if (!backend) {
    return (
      <div className="login"><div className="login-card">
        <div className="brand">Moda<b>Enma</b></div>
        <h1>Falta conectar Firebase</h1>
        <p className="muted">Copia <code>.env.example</code> a <code>.env</code> y rellena las claves de tu proyecto de Firebase. Después reinicia el panel. Para probarlo sin Firebase usa <code>VITE_DEMO=1</code>.</p>
      </div></div>
    );
  }
  if (user === undefined) return <div className="login"><div className="empty"><div className="big" aria-hidden>🌸</div></div></div>;
  if (!user) return <><Login backend={backend} /><Toaster position="top-center" richColors /></>;

  if (!user.isAdmin) return <><NoAccess user={user} backend={backend} onUser={setUser} /><Toaster position="top-center" richColors /></>;

  return (
    <ConfirmProvider>
      <DataProvider backend={backend}>
        <Shell user={user} onSignOut={() => backend.auth.signOut()} />
      </DataProvider>
      <Toaster position="top-center" richColors toastOptions={{ style: { borderRadius: 16, fontFamily: 'inherit' } }} />
    </ConfirmProvider>
  );
}
