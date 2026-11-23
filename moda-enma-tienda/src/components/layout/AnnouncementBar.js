// moda-enma-tienda/src/components/layout/AnnouncementBar.js
// Marquesina superior. Solo dice cosas que son ciertas según site.config.
import { SITE_CONFIG } from '@/site.config';
import { eur } from '@/lib/format';

export default function AnnouncementBar() {
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;
  const items = [
    delivery.enabled && `Envío a domicilio ${eur(delivery.cost)}`,
    meetup.enabled && `O quedamos en ${SITE_CONFIG.brand.city}: sin gastos de envío`,
    'Paga con PayPal o en efectivo',
    SITE_CONFIG.legal.taxIncludedText,
    `${SITE_CONFIG.legal.withdrawalDays} días para devolver`,
  ].filter(Boolean);
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-ink py-2.5 text-cream" role="region" aria-label="Información de compra">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[12px] font-medium tracking-wide">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10" aria-hidden={i >= items.length}>
            {t}
            <span className="text-terracotta" aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
