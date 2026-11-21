// moda-enma-tienda/src/app/envios-devoluciones/page.js
import Link from 'next/link';
import LegalPage, { H, P, UL, owner } from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/site.config';
import { eur } from '@/lib/format';

export const metadata = { title: 'Envíos y devoluciones' };

export default function Page() {
  const o = owner();
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;
  const days = SITE_CONFIG.legal.withdrawalDays;
  return (
    <LegalPage title="Envíos y devoluciones" intro="Lo que necesitas saber antes y después de comprar.">
      <H>Cómo recibes tu pedido</H>
      <UL>
        {delivery.enabled && <li><strong>{delivery.label}:</strong> {eur(delivery.cost)} por pedido, a {SITE_CONFIG.shipping.shipsTo}. Llega en 2-4 días laborables desde que confirmamos el pago. Pagas con PayPal.</li>}
        {meetup.enabled && <li><strong>{meetup.label}:</strong> sin coste. Te escribimos para acordar lugar y hora. Pagas en mano o con PayPal.</li>}
      </UL>
      <P>Aún no hay envío gratis: el coste es el mismo para cualquier importe.</P>
      <H>Cómo pagas</H>
      <P>Con PayPal o en mano (solo si quedamos en persona). No aceptamos otros medios de pago.</P>
      <H>Cómo devolver</H>
      <UL>
        <li>Tienes {days} días naturales desde que lo recibes para desistir.</li>
        <li>Escríbenos a {o.email} con tu número de pedido.</li>
        <li>Devuelve la prenda sin usar y con etiquetas. El coste de devolución es tuyo.</li>
        <li>Te reembolsamos por el mismo medio de pago en un máximo de {days} días desde que recibimos la devolución.</li>
      </UL>
      <P>El detalle completo está en los <Link className="underline underline-offset-2" href="/terminos-y-condiciones">términos y condiciones</Link>.</P>
    </LegalPage>
  );
}
