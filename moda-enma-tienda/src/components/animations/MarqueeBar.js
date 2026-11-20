'use client';

export default function MarqueeBar({ items = [] }) {
  const defaultItems = [
    "MODAENMA BOUTIQUE • ENVÍO GRATUITO EN PEDIDOS SUPERIORES A 90€",
    "NUEVA COLECCIÓN CÁPSULA PRIMAVERA / VERANO",
    "DEPORTE & ACCESORIOS PREMIUM • BOTELLES METÁLICAS 3D",
    "ENTREGA RÁPIDA 24H/48H EN ESPAÑA Y PORTUGAL",
    "SATISFACCIÓN GARANTIZADA • DEVOLUCIONES SENCILLAS 30 DÍAS"
  ];

  const list = items.length > 0 ? items : defaultItems;

  return (
    <div className="w-full bg-warm-sand border-y border-warm-border py-3 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-semibold tracking-editorial text-warm-dark">
        {list.concat(list).map((text, i) => (
          <span key={i} className="flex items-center gap-6">
            <span>{text}</span>
            <span className="text-brand-terracotta font-bold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
