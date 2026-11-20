import Link from 'next/link';
import { SITE_CONFIG } from '@/site.config';

export const metadata = {
  title: 'Aviso Legal | ModaEnma',
  description: 'Datos identificativos y condiciones de uso del portal ModaEnma Boutique.'
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-warm-border pb-6">
        <span className="text-editorial-sub">LSSI-CE & TRANSPARENCIA</span>
        <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight mt-1">
          Aviso Legal
        </h1>
        <p className="text-xs text-warm-muted mt-2">Cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE)</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-warm-muted space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">1. Datos Identificativos</h2>
          <p>
            En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se reflejan los siguientes datos:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Titular</strong>: {SITE_CONFIG.brand.legalName} [REVISAR CON GESTOR]</li>
            <li><strong>NIF/CIF</strong>: {SITE_CONFIG.brand.nif}</li>
            <li><strong>Domicilio Social</strong>: {SITE_CONFIG.brand.address}</li>
            <li><strong>Correo Electrónico</strong>: {SITE_CONFIG.brand.email}</li>
            <li><strong>Actividad Comercial</strong>: Comercio al por menor de prendas de vestir y complementos de moda.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">2. Propiedad Intelectual</h2>
          <p>
            Los textos, imágenes de producto, diseño gráfico y código fuente son titularidad exclusiva de ModaEnma o disponen de las licencias correspondientes. Queda prohibida su reproducción o distribución sin consentimiento previo.
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

