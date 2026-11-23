// moda-enma-tienda/src/app/terminos-y-condiciones/page.js
import LegalPage, { H, P, UL, owner } from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/site.config';
import { eur } from '@/lib/format';

export const metadata = { title: 'Términos y condiciones', alternates: { canonical: '/terminos-y-condiciones' } };

export default function Page() {
  const o = owner();
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;
  const days = SITE_CONFIG.legal.withdrawalDays;
  return (
    <LegalPage title="Términos y condiciones de compra" intro="Condiciones aplicables a las compras realizadas en este sitio web.">
      <H>1. Quién vende</H>
      <P>Vendedor: {o.name}, NIF {o.nif}, domicilio {o.address}, correo {o.email}, bajo el nombre comercial {SITE_CONFIG.brand.name}.</P>
      <H>2. Productos y precios</H>
      <P>Los precios están en euros y {SITE_CONFIG.legal.taxIncludedText.toLowerCase()}. Los gastos de envío, si los hay, se indican antes de pagar y se suman al total. Las fotografías e ilustraciones son orientativas; los colores pueden variar ligeramente según tu pantalla.</P>
      <H>3. Cómo se hace un pedido</H>
      <P>Eliges producto y talla, lo añades a la bolsa, rellenas tus datos, escoges entrega y pago, aceptas estas condiciones y confirmas. Tras confirmar, ves una página con tu número de pedido. El contrato se entiende formalizado cuando confirmamos disponibilidad y, en el pago con PayPal, cuando el pago se completa.</P>
      <H>4. Entrega</H>
      <UL>
        {delivery.enabled && <li><strong>{delivery.label}</strong>: {eur(delivery.cost)} por pedido, a {SITE_CONFIG.shipping.shipsTo}, en 2-4 días laborables desde la confirmación del pago. Se paga con PayPal.</li>}
        {meetup.enabled && <li><strong>{meetup.label}</strong>: sin gastos de envío. Acordamos contigo lugar y hora. Se puede pagar en efectivo o con PayPal.</li>}
      </UL>
      <H>5. Formas de pago</H>
      <P>Aceptamos únicamente PayPal y pago en efectivo (solo cuando la entrega es en persona). El pago con PayPal se procesa en la plataforma de PayPal; no almacenamos datos de tarjetas ni de cuentas.</P>
      <H>6. Derecho de desistimiento</H>
      <P>Tienes {days} días naturales desde que recibes el producto para desistir de la compra sin dar explicaciones. Para ejercerlo, escríbenos a {o.email} indicando tu número de pedido. Devuelve el producto sin usar, con sus etiquetas y en buen estado, a más tardar {days} días después de comunicarnos tu decisión. Los costes directos de devolución corren a tu cargo. Te reembolsaremos todos los pagos, incluidos los gastos de envío estándar, en un máximo de {days} días desde que recibamos el producto o la prueba de su devolución, por el mismo medio de pago que usaste.</P>
      <P>El desistimiento no aplica a productos confeccionados a medida o claramente personalizados, ni a artículos de higiene que hayan sido desprecintados.</P>
      <H>7. Garantía legal</H>
      <P>Los productos nuevos tienen una garantía legal de 3 años desde la entrega frente a faltas de conformidad, según el Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios. Si algo no es conforme, contáctanos y lo reparamos, sustituimos, rebajamos el precio o resolvemos el contrato según proceda.</P>
      <H>8. Disponibilidad y errores</H>
      <P>Mostramos el stock disponible en cada momento. Si, aun así, un artículo no estuviera disponible, te lo diremos y te reembolsaremos cualquier importe ya pagado. Si detectamos un error evidente de precio, te lo comunicaremos antes de aceptar el pedido.</P>
      <H>9. Reclamaciones</H>
      <P>Escríbenos a {o.email} y responderemos lo antes posible. También puedes acudir a los servicios de consumo de tu comunidad autónoma.</P>
      <H>10. Ley aplicable</H>
      <P>Estas condiciones se rigen por la ley española. Como consumidor, mantienes los derechos que te reconoce la normativa imperativa de tu lugar de residencia.</P>
    </LegalPage>
  );
}
