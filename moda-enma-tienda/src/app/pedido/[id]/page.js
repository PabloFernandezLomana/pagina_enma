// moda-enma-tienda/src/app/pedido/[id]/page.js
import Link from 'next/link';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { eur } from '@/lib/format';
import { SITE_CONFIG, whatsappLink } from '@/site.config';
import { meetupWhatsAppText } from '@/lib/emailTemplates';
import { CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pedido recibido', robots: { index: false } };

export default async function OrderPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const isDemo = searchParams?.demo === '1';
  let order = null;
  const db = getAdminDb();
  if (db && searchParams?.t) {
    const snap = await db.collection('orders').doc(params.id).get();
    if (snap.exists && snap.data().accessToken === searchParams.t) order = snap.data();
  }
  const meetup = order?.shippingMethod === 'meetup';
  const wa = whatsappLink(meetup ? meetupWhatsAppText(order) : `Hola, soy ${order?.clientName || ''} y escribo por mi pedido ${params.id}`);

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
  const waiting = order?.paymentStatus === 'awaiting_payment';
  const cancelled = order?.status === 'Cancelado';
  const cash = order?.paymentMethod === 'cash';

  return (
    <section className="wrap max-w-[760px] py-14 sm:py-20">
      {isDemo && <p className="mb-6 rounded-md bg-warn/15 px-4 py-3 text-[14px] font-semibold">Pedido de prueba: no se ha guardado nada porque la tienda está en modo demostración.</p>}
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${paid || isDemo ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>{paid || isDemo ? <CheckCircle2 size={28} /> : <Clock size={28} />}</span>
      <h1 className="h-display mt-5 text-[clamp(40px,6vw,72px)]">{cancelled ? 'Pedido cancelado' : waiting ? 'Estamos confirmando tu pago' : paid ? '¡Pago recibido, gracias!' : '¡Pedido recibido, gracias!'}</h1>
      {waiting && !cancelled && <p className="mt-3 rounded-md bg-warn/15 px-4 py-3 text-[15px] font-semibold">PayPal aún no nos ha confirmado el pago. Recarga esta página en un minuto. Si no se completa, no se te cobrará y la prenda se libera sola a los 30 minutos.</p>}
      <p className="mt-3 text-[17px] text-ink-soft">Número de pedido <strong className="text-ink">{params.id}</strong>. Guarda esta página o hazle una captura.</p>

      {order && (
        <>
          <div className="mt-8 rounded-lg border border-line bg-paper p-6">
            <h2 className="text-[17px] font-bold">Qué pasa ahora</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
              {cancelled ? 'Este pedido se ha cancelado. Si crees que es un error, escríbenos por WhatsApp.' : waiting ? 'En cuanto PayPal confirme el pago, te enviamos el correo de confirmación.' : meetup
                ? `${cash ? `Pagas ${eur(order.total)} en efectivo cuando nos veamos. ` : 'Hemos recibido tu pago. '}Quedamos en ${SITE_CONFIG.brand.city}: el día, la hora y el lugar los acordamos por WhatsApp, cuando mejor nos venga a los dos.`
                : `Hemos recibido tu pago. Lo preparamos y lo enviamos a ${order.clientAddress} (2-4 días laborables). Te avisaremos por correo cuando salga.`}
            </p>
            <p className="mt-3 text-[15px] font-semibold">Estado: {order.status}{order.trackingCode ? ` · ${order.carrier ? `${order.carrier}: ` : 'Seguimiento: '}${order.trackingCode}` : ''}</p>
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
        <Link href="/" className={meetup && wa ? 'btn btn-ghost' : 'btn btn-primary'}>Seguir mirando</Link>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={meetup ? 'btn btn-primary' : 'btn btn-ghost'}>{meetup ? 'Escribirme para quedar' : 'Escribirnos por WhatsApp'}</a>}
      </div>
    </section>
  );
}
