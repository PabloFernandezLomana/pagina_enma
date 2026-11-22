'use client';
// moda-enma-tienda/src/components/home/FloatingPick.js
// Tarjeta flotante a la derecha que acompaña el scroll y cambia según la sección que estás viendo.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowUpRight } from 'lucide-react';
import { eur } from '@/lib/format';

export default function FloatingPick({ picks }) {
  const [current, setCurrent] = useState(picks[0]?.sectionId);
  const [closed, setClosed] = useState(false);
  const ratios = useRef({});

  useEffect(() => {
    if (!picks.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { ratios.current[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
        const best = Object.entries(ratios.current).sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) setCurrent(best[0]);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    );
    picks.forEach((p) => { const el = document.getElementById(p.sectionId); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [picks]);

  const pick = picks.find((p) => p.sectionId === current) || picks[0];
  if (!pick || closed) return null;
  const { product, label } = pick;

  return (
    <aside className="pointer-events-none fixed bottom-8 right-6 z-20 hidden w-[216px] xl:block" aria-label="Pieza sugerida">
      <div className="pointer-events-auto animate-float">
        <div key={product.id} className="animate-[rise_0.5s_var(--ease-out)] overflow-hidden rounded-lg bg-paper shadow-lift ring-1 ring-line">
          <Link href={`/producto/${product.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
              {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="216px" className="zoom-img object-cover object-top group-hover:scale-105" />}
            </div>
            <div className="flex items-start justify-between gap-2 p-3.5">
              <div className="min-w-0">
                <p className="eyebrow !text-[10px]">{label}</p>
                <p className="mt-1 truncate text-[14px] font-semibold">{product.name}</p>
                <p className="text-[13px] text-ink-soft">{eur(product.salePrice)}</p>
              </div>
              <ArrowUpRight size={18} className="mt-1 shrink-0 text-terracotta-deep transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
        <button onClick={() => setClosed(true)} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream shadow-soft transition-transform active:scale-90" aria-label="Ocultar sugerencia"><X size={14} /></button>
      </div>
    </aside>
  );
}
