import Link from 'next/link';
import { SITE_CONFIG } from '@/site.config';

export const metadata = {
  title: 'Política de Privacidad | ModaEnma',
  description: 'Información sobre el tratamiento de datos personales conforme al RGPD.'
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-warm-border pb-6">
        <span className="text-editorial-sub">RGPD & PROTECCIÓN DE DATOS</span>
        <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight mt-1">
          Política de Privacidad
        </h1>
        <p className="text-xs text-warm-muted mt-2">Conforme al Reglamento General de Protección de Datos (UE) 2016/679</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-warm-muted space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">1. Responsable del Tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos recogidos en este sitio web es <strong>{SITE_CONFIG.brand.legalName}</strong> con NIF <strong>{SITE_CONFIG.brand.nif}</strong> y dirección de contacto <strong>{SITE_CONFIG.brand.email}</strong>. [REVISAR CON GESTOR]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">2. Finalidad del Tratamiento</h2>
          <p>
            Los datos personales proporcionados por los clientes (nombre, teléfono, email, dirección de entrega) son tratados con la exclusiva finalidad de gestionar los pedidos tramitados, coordinar la entrega o recogida local en Málaga y mantener la comunicación informativa relativa a sus compras.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">3. Destinatarios de los Datos</h2>
          <p>
            Los datos no se cederán a terceros ajenos salvo obligación legal o a proveedores de servicio indispensables para la prestación del servicio: pasarela de pago (PayPal) y servicios de infraestructura cloud (Google Cloud / Firebase).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">4. Derechos del Interesado</h2>
          <p>
            Usted puede ejercitar en cualquier momento sus derechos de acceso, rectificación, supresión, limitación y oposición remitiendo una comunicación por escrito al correo <strong>{SITE_CONFIG.brand.email}</strong>, así como presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
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

