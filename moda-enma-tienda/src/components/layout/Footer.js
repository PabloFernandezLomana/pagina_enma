'use client';

import Link from 'next/link';
import { Instagram, MessageCircle, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '@/lib/mockCatalog';
import { SITE_CONFIG } from '@/site.config';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hasInstagram = Boolean(SITE_CONFIG.social.instagram && !SITE_CONFIG.social.instagram.includes('TODO-LANZAMIENTO'));
  const hasWhatsapp = Boolean(SITE_CONFIG.social.whatsappLink && !SITE_CONFIG.social.whatsappLink.includes('TODO-LANZAMIENTO'));

  return (
    <footer className="bg-[#FAF8F5] text-warm-dark border-t border-warm-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: 5 Columnas de Usabilidad Editorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-warm-border">
          
          {/* Columna 1: Marca & Boutique Local */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-light tracking-[0.2em] text-warm-dark block uppercase">
                {SITE_CONFIG.brand.name}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-warm-muted block mt-1 font-semibold">
                Boutique • {SITE_CONFIG.brand.city}
              </span>
            </Link>
            <p className="text-xs text-warm-muted leading-relaxed max-w-sm pt-1">
              Ropa pensada para el día a día, colecciones seleccionadas con mimo y atención directa. Moda cercana desde Málaga.
            </p>
            
            {/* Redes Sociales (Se muestran solo si están configuradas) */}
            <div className="flex items-center gap-3 pt-2">
              {hasInstagram && (
                <a
                  href={SITE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de ModaEnma"
                  className="w-9 h-9 rounded-full border border-warm-border flex items-center justify-center hover:border-brand-terracotta hover:text-brand-terracotta text-warm-dark transition-colors bg-white shadow-2xs"
                >
                  <Instagram size={16} />
                </a>
              )}
              {hasWhatsapp && (
                <a
                  href={SITE_CONFIG.social.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp de Atención al Cliente"
                  className="w-9 h-9 rounded-full border border-warm-border flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] text-warm-dark transition-colors bg-white shadow-2xs"
                >
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Columna 2: Comprar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-editorial uppercase text-warm-dark mb-4">
              Comprar
            </h4>
            <ul className="space-y-2.5 text-xs">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/${c.id}`} className="text-warm-muted hover:text-warm-dark transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Ayuda & Boutique */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-editorial uppercase text-warm-dark mb-4">
              Ayuda & Boutique
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-muted">
              <li>
                <Link href="/sobre-nosotros" className="hover:text-warm-dark transition-colors">
                  Sobre la Marca
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-warm-dark transition-colors">
                  Contacto Boutique
                </Link>
              </li>
              <li>
                <Link href="/envios-y-devoluciones" className="hover:text-warm-dark transition-colors">
                  Envíos y Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Información Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-editorial uppercase text-warm-dark mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-muted">
              <li>
                <Link href="/aviso-legal" className="hover:text-warm-dark transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-warm-dark transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-warm-dark transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-warm-dark transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Medios de Pago Permitidos (Únicamente PayPal y Pago en mano) */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-warm-muted font-medium">
          <p>© {currentYear} {SITE_CONFIG.brand.name}. {SITE_CONFIG.legal.taxIncludedText}.</p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-warm-dark">Métodos de Pago:</span>
              <span className="px-2.5 py-1 bg-white border border-warm-border rounded-xs font-bold text-warm-dark">
                PayPal
              </span>
              <span className="px-2.5 py-1 bg-white border border-warm-border rounded-xs font-bold text-warm-dark">
                Pago en mano
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Botón Flotante Discreto de WhatsApp (No invade el Sticky Buy Bar) */}
      {hasWhatsapp && (
        <a
          href={SITE_CONFIG.social.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <MessageCircle size={22} />
        </a>
      )}
    </footer>
  );
}
