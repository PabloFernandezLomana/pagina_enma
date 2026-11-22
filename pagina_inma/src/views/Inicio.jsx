// pagina_inma/src/views/Inicio.jsx
import { useMemo } from 'react';
import { ShoppingBag, AlertTriangle, Wallet, TrendingUp, Eye, Plus } from 'lucide-react';
import { useData } from '../lib/data';
import { eur, timeAgo, totalStock, LOW_STOCK_DEFAULT } from '../lib/format';
import { salesByDay, monthSummary, productRanking, funnel } from '../lib/stats';
import { BarChart } from '../components/charts';
import { Empty } from '../components/ui';

function Rank({ rows, valueKey, unit }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  if (!rows.length) return <p className="muted small">Todavía no hay datos. Aparecerán cuando entre gente en la tienda.</p>;
  return (
    <div className="rank">
      {rows.map((r) => (
        <div className="rank-row" key={r.id}>
          <img className="thumb thumb-sm" src={r.product.images?.[0]} alt="" loading="lazy" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row between"><span className="title" style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product.name}</span><b className="num">{r[valueKey]} <span className="muted small" style={{ fontWeight: 500 }}>{unit}</span></b></div>
            <div className="bar-bg"><i style={{ width: `${(r[valueKey] / max) * 100}%` }} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Inicio({ go }) {
  const { orders, products, stats } = useData();
  const month = useMemo(() => monthSummary(orders), [orders]);
  const days = useMemo(() => salesByDay(orders, 14), [orders]);
  const ranking = useMemo(() => productRanking(stats, orders, products, 30), [stats, orders, products]);
  const fun = useMemo(() => funnel(stats, orders, 30), [stats, orders]);
  const toPrepare = orders.filter((o) => o.status === 'Pendiente' || o.status === 'Preparando');
  const toCollect = orders.filter((o) => o.paymentMethod === 'cash' && o.paymentStatus === 'pending' && o.status !== 'Cancelado');
  const low = products.filter((p) => p.active !== false && totalStock(p) <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT));
  const hour = new Date().getHours();
  const greet = hour < 14 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div><h1>{greet} 👋</h1><p>Esto es lo que está pasando hoy en ModaEnma.</p></div>
        <div className="actions"><button className="btn btn-primary" onClick={() => go('productos', { new: Date.now() })}><Plus aria-hidden />Subir un producto</button></div>
      </div>

      <div className="kpis">
        <button className="kpi t-pink rise" style={{ '--i': 0 }} onClick={() => go('pedidos')}><span className="ico"><ShoppingBag aria-hidden /></span><strong className="num">{toPrepare.length}</strong><span>Pedidos por preparar</span></button>
        <button className="kpi t-honey rise" style={{ '--i': 1 }} onClick={() => go('productos')}><span className="ico"><AlertTriangle aria-hidden /></span><strong className="num">{low.length}</strong><span>Productos con poco stock</span></button>
        <div className="kpi t-blue rise" style={{ '--i': 2 }}><span className="ico"><Wallet aria-hidden /></span><strong className="num">{eur(month.revenue)}</strong><span>Vendido este mes ({month.count} pedidos)</span></div>
        <div className="kpi t-olive rise" style={{ '--i': 3 }}><span className="ico"><TrendingUp aria-hidden /></span><strong className="num">{eur(month.profit)}</strong><span>Ganancia estimada del mes</span></div>
      </div>

      <div className="two-col">
        <div className="stack-lg">
          <section className="card rise" style={{ '--i': 4 }}>
            <div className="card-head"><h2>Ventas de los últimos 14 días</h2><span className="muted small">{eur(days.reduce((s, d) => s + d.value, 0))}</span></div>
            <BarChart data={days} />
          </section>

          <section className="card rise" style={{ '--i': 5 }}>
            <div className="card-head"><h2>Para hacer ahora</h2></div>
            {toPrepare.length + toCollect.length + low.length === 0 ? (
              <Empty emoji="✨" title="Todo al día" text="No hay nada pendiente. ¡Buen trabajo!" />
            ) : (
              <div className="list">
                {toPrepare.slice(0, 4).map((o) => (
                  <button key={o.id} className="item" onClick={() => go('pedidos', { open: o.id })}>
                    <span className="avatar">{(o.clientName || '?')[0]}</span>
                    <span className="grow"><span className="title" style={{ display: 'block' }}>{o.status === 'Pendiente' ? 'Preparar' : 'Terminar'} pedido de {o.clientName}</span><span className="muted small">{o.id} · {eur(o.total)} · {timeAgo(o.createdAt)}</span></span>
                    <span className="badge b-pink">{o.status}</span>
                  </button>
                ))}
                {toCollect.slice(0, 3).map((o) => (
                  <button key={o.id} className="item" onClick={() => go('pedidos', { open: o.id })}>
                    <span className="avatar" style={{ background: 'rgb(var(--c-ninos))' }}>€</span>
                    <span className="grow"><span className="title" style={{ display: 'block' }}>Cobrar {eur(o.total)} a {o.clientName}</span><span className="muted small">Pago en mano · {o.id}</span></span>
                  </button>
                ))}
                {low.slice(0, 3).map((p) => (
                  <button key={p.id} className="item" onClick={() => go('productos', { open: p.id })}>
                    <img className="thumb thumb-sm" src={p.images?.[0]} alt="" />
                    <span className="grow"><span className="title" style={{ display: 'block' }}>Queda poco de {p.name}</span><span className="muted small">{totalStock(p)} unidades en total</span></span>
                    <span className="badge b-warn">Reponer</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stack-lg">
          <section className="card rise" style={{ '--i': 6 }}>
            <div className="card-head"><h2><Eye size={16} style={{ verticalAlign: '-2px' }} aria-hidden /> Lo más visto</h2><span className="muted small">30 días</span></div>
            <Rank rows={[...ranking].sort((a, b) => b.views - a.views).filter((r) => r.views).slice(0, 5)} valueKey="views" unit="visitas" />
          </section>
          <section className="card rise" style={{ '--i': 7 }}>
            <div className="card-head"><h2>🛍️ Lo más comprado</h2><span className="muted small">30 días</span></div>
            <Rank rows={[...ranking].sort((a, b) => b.sold - a.sold).filter((r) => r.sold).slice(0, 5)} valueKey="sold" unit="uds." />
          </section>
          <section className="card rise" style={{ '--i': 8 }}>
            <div className="card-head"><h2>Del escaparate a la bolsa</h2><span className="muted small">30 días</span></div>
            <div className="funnel">
              <div className="t-blue"><span>Visitas a productos</span><b className="num">{fun.views}</b></div>
              <div className="t-pink"><span>Añadidos a la bolsa</span><b className="num">{fun.carts}</b></div>
              <div className="t-olive"><span>Pedidos desde la web</span><b className="num">{fun.orders}</b></div>
            </div>
            {fun.views > 0 && <p className="hint" style={{ marginTop: 10 }}>De cada 100 visitas, {Math.round((fun.carts / fun.views) * 100)} acaban en la bolsa.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
