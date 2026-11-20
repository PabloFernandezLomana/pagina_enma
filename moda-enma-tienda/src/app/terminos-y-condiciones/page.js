import Link from 'next/link';
import { SITE_CONFIG } from '@/site.config';

export const metadata = {
  title: 'Términos y Condiciones de Venta | ModaEnma',
  description: 'Condiciones de compra, envíos locales en Málaga, devoluciones y pagos.'
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-warm-border pb-6">
        <span className="text-editorial-sub">INFORMACIÓN CONTRACTUAL</span>
        <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight mt-1">
          Términos y Condiciones de Venta
        </h1>
        <p className="text-xs text-warm-muted mt-2">Última actualización: Noviembre de 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-warm-muted space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">1. Identificación del Titular</h2>
          <p>
            El presente sitio web es operado por <strong>{SITE_CONFIG.brand.legalName}</strong> (en adelante, &quot;ModaEnma&quot;), con NIF/CIF <strong>{SITE_CONFIG.brand.nif}</strong>, con domicilio en <strong>{SITE_CONFIG.brand.address}</strong>, y correo electrónico de contacto <strong>{SITE_CONFIG.brand.email}</strong>. [REVISAR CON GESTOR]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">2. Ámbito y Precios</h2>
          <p>
            ModaEnma comercializa sus prendas y complementos exclusivamente con destino en <strong>Málaga y alrededores</strong>. {SITE_CONFIG.legal.taxIncludedText}. No se aplicarán cargos ocultos en el proceso de compra.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">3. Medios de Pago Permitidos</h2>
          <p>
            Se admiten únicamente dos modalidades de abono:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>PayPal</strong>: Pago electrónico seguro mediante plataforma certificada con cargo en el momento de la confirmación del pedido.</li>
            <li><strong>Pago en mano</strong>: Pago en efectivo al momento de la recogida en tienda o entrega local acordada.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">4. Envíos y Recogida Local</h2>
          <p>
            Las compras tramitadas para recogida en tienda no conllevan gastos de envío. Para entregas a domicilio dentro de las zonas habilitadas de Málaga, el coste de reparto es de {SITE_CONFIG.shipping.localDeliveryCost.toFixed(2)} €, resultando <strong>gratuito para pedidos a partir de {SITE_CONFIG.shipping.freeShippingThreshold.toFixed(2)} €</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">5. Derecho de Desistimiento (14 Días)</h2>
          <p>
            Conforme a la legislación vigente de consumidores de la UE, el cliente dispone de un plazo de <strong>{SITE_CONFIG.legal.withdrawalDays} días naturales</strong> desde la recepción del artículo para ejercer su derecho de desistimiento sin necesidad de justificación, siempre que las prendas se encuentren en su estado original y sin usar.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">6. Jurisdicción y Ley Aplicable</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de controversias, las partes se someten a los juzgados y tribunales del domicilio del consumidor. [REVISAR CON GESTOR]
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-warm-border">
        <Link href="/" className="text-xs font-bold tracking-editorial uppercase text-brand-terracotta hover:underline">
          ← Volver a la Tienda
        </Link>
      </div>
    </div>
  );
}

