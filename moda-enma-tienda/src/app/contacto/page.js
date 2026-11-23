// moda-enma-tienda/src/app/contacto/page.js
import { Mail, MessageCircle, Instagram, Phone } from 'lucide-react';
import { SITE_CONFIG, hasValue } from '@/site.config';

export const metadata = { title: 'Contacto', alternates: { canonical: '/contacto' } };

export default function ContactPage() {
  const b = SITE_CONFIG.brand;
  const wa = hasValue(b.whatsapp) ? `https://wa.me/${b.whatsapp.replace(/\D/g, '')}` : '';
  const channels = [
    hasValue(b.email) && { href: `mailto:${b.email}`, label: 'Correo', value: b.email, Icon: Mail },
    wa && { href: wa, label: 'WhatsApp', value: 'Escríbenos', Icon: MessageCircle },
    hasValue(SITE_CONFIG.social.instagram) && { href: SITE_CONFIG.social.instagram, label: 'Instagram', value: 'Mándanos un mensaje', Icon: Instagram },
    hasValue(b.phone) && { href: `tel:${b.phone.replace(/\s/g, '')}`, label: 'Teléfono', value: b.phone, Icon: Phone },
  ].filter(Boolean);

  return (
    <section className="wrap max-w-[800px] py-12 sm:py-16">
      <p className="eyebrow">Contacto</p>
      <h1 className="h-display mt-2 text-[clamp(40px,6vw,72px)]">Hablemos</h1>
      <p className="mt-4 text-[17px] text-ink-soft">¿Dudas con una talla, un pedido o una devolución? Te respondemos lo antes posible.</p>
      {channels.length ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {channels.map(({ href, label, value, Icon }) => (
            <li key={label}>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="card-lift flex min-h-[88px] items-center gap-4 rounded-lg border border-line bg-paper p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-deep"><Icon size={20} /></span>
                <span><span className="block text-[13px] font-semibold text-ink-soft">{label}</span><span className="block text-[17px] font-bold">{value}</span></span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-lg bg-warn/15 px-6 py-5 text-[16px] font-medium">Estamos activando los canales de contacto. Vuelve a pasar en unos días.</p>
      )}
      <p className="mt-8 text-[15px] text-ink-soft">{b.city}, {b.country}.</p>
    </section>
  );
}
