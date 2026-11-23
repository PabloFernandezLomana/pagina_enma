// moda-enma-tienda/src/components/layout/Footer.js
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Mail } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/categories';
import { SITE_CONFIG, hasValue } from '@/site.config';

const TikTok = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M16.6 2h-3.2v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.1 6.1 0 1 0 5.2 6V8.6a7.5 7.5 0 0 0 4.4 1.4V6.8a4.4 4.4 0 0 1-4.4-4.8Z" />
  </svg>
);

export default function Footer() {
  const { brand, social } = SITE_CONFIG;
  const wa = hasValue(brand.whatsapp) ? `https://wa.me/${brand.whatsapp.replace(/\D/g, '')}` : '';
  const networks = [
    hasValue(social.instagram) && { href: social.instagram, label: 'Instagram', Icon: Instagram },
    hasValue(social.tiktok) && { href: social.tiktok, label: 'TikTok', Icon: TikTok },
    hasValue(social.facebook) && { href: social.facebook, label: 'Facebook', Icon: Facebook },
    wa && { href: wa, label: 'WhatsApp', Icon: MessageCircle },
    hasValue(brand.email) && { href: `mailto:${brand.email}`, label: 'Correo', Icon: Mail },
  ].filter(Boolean);

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-[36px] font-semibold leading-none">Moda<span className="text-terracotta">Enma</span></p>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-cream/75">{brand.tagline}. Ropa, deporte y accesorios para toda la familia.</p>
          {networks.length > 0 && (
            <ul className="mt-6 flex gap-2.5" aria-label="Redes sociales y contacto">
              {networks.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 transition-[background-color,transform] duration-200 hover:bg-cream hover:text-ink active:scale-95">
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Comprar">
          {DEPARTMENTS.map((d) => <FooterLink key={d.id} href={`/${d.id}`}>{d.name}</FooterLink>)}
        </FooterCol>
        <FooterCol title="Ayuda">
          <FooterLink href="/envios-devoluciones">Envíos y devoluciones</FooterLink>
          <FooterLink href="/contacto">Contacto</FooterLink>
          <FooterLink href="/sobre-nosotros">Quiénes somos</FooterLink>
        </FooterCol>
        <FooterCol title="Legal">
          <FooterLink href="/terminos-y-condiciones">Términos y condiciones</FooterLink>
          <FooterLink href="/privacidad">Política de privacidad</FooterLink>
          <FooterLink href="/cookies">Política de cookies</FooterLink>
          <FooterLink href="/aviso-legal">Aviso legal</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-cream/15">
        <div className="wrap flex flex-col gap-2 py-6 text-[13px] text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. {brand.city}, {brand.country}.</p>
          <p>Pago con PayPal o en efectivo · {SITE_CONFIG.legal.taxIncludedText.toLowerCase()}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/55">{title}</h2>
      <ul className="mt-4 space-y-1">{children}</ul>
    </nav>
  );
}
const FooterLink = ({ href, children }) => (
  <li><Link href={href} className="link-draw inline-flex min-h-[40px] items-center text-[15px] text-cream/90">{children}</Link></li>
);
