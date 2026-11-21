// moda-enma-tienda/src/app/pedido/[id]/page.js
import Link from 'next/link';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { eur } from '@/lib/format';
import { SITE_CONFIG, hasValue } from '@/site.config';
import { CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pedido recibido', robots: { index: false } };

export default async function OrderPage({ params, searchParams }) {
  const isDemo = searchParams?.demo === '1';
  let order = null;
  const db = getAdminDb();
  if (db && searchParams?.t) {
    const snap = await db.collection('orders').doc(params.id).get();
    if (snap.exists && snap.data().accessToken === searchParams.t) order = snap.data();
  }
  const wa = hasValue(SITE_CONFIG.brand.whatsapp) ? `https://wa.me/${SITE_CONFIG.brand.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, soy ${order?.clientName || ''} y escribo por mi pedido ${params.id}`)}` : '';

  if (!order && !isDemo) {
    return (
      <section className="wrap flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="h-display text-[clamp(40px,6vw,72px)]">No encontramos este pedido</h1>
        <p className="mt-3 max-w-[46ch] text-[17px] text-ink-soft">El enlace puede estar incompleto. Usa el enlace exacto que te mostramos al terminar la compra.</p>
        <Link href="/" className="btn btn-primary mt-8">Volver a la tienda</Link>
      </section>
    );
  }

  const paid = order?.paymentStatus === 'paid';
  const cash = order?.paymentMethod === 'cash';

  return (
    <section className="wrap max-w-[760px] py-14 sm:py-20">
      {isDemo && <p className="mb-6 rounded-md bg-warn/15 px-4 py-3 text-[14px] font-semibold">Pedido de prueba: no se ha guardado nada porque la tienda está en modo demostración.</p>}
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${paid || isDemo ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>{paid || isDemo ? <CheckCircle2 size={28} /> : <Clock size={28} />}</span>
      <h1 className="h-display mt-5 text-[clamp(40px,6vw,72px)]">{paid ? '¡Pago recibido, gracias!' : '¡Pedido recibido, gracias!'}</h1>
      <p className="mt-3 text-[17px] text-ink-soft">Número de pedido <strong className="text-ink">{params.id}</strong>. Guarda esta página o hazle una captura.</p>

      {order && (
        <>
          <div className="mt-8 rounded-lg border border-line bg-paper p-6">
            <h2 className="text-[17px] font-bold">Qué pasa ahora</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
              {cash
                ? `Te escribiremos al ${order.clientPhone} o a ${order.clientEmail} para quedar. Pagas ${eur(order.total)} en mano cuando lo recibas.`
                : order.shippingMethod === 'meetup'
                  ? `Hemos recibido tu pago. Te escribiremos al ${order.clientPhone} para quedar en ${SITE_CONFIG.brand.city}.`
                  : `Hemos recibido tu pago. Lo preparamos y lo enviamos a ${order.clientAddress} (2-4 días laborables). Te avisaremos cuando salga.`}
            </p>
          </div>
          <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-paper px-6">
            {order.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-4 text-[15px]"><span>{i.productName} · talla {i.size} × {i.quantity}</span><span className="font-semibold tabular-nums">{eur(i.total)}</span></li>
            ))}
            <li className="flex justify-between py-4 text-[15px]"><span className="text-ink-soft">Envío</span><span className="tabular-nums">{order.shippingCost ? eur(order.shippingCost) : 'Gratis'}</span></li>
            <li className="flex justify-between py-4 text-[18px] font-bold"><span>Total</span><span className="tabular-nums">{eur(order.total)}</span></li>
          </ul>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">Seguir mirando</Link>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Escribirnos por WhatsApp</a>}
      </div>
    </section>
  );
}
