'use client';
// moda-enma-tienda/src/components/home/CoverFlow.js
// Carrusel 3D hecho solo con CSS 3D (sin librerías): las prendas destacadas giran en un arco.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { eur } from '@/lib/format';

export default function CoverFlow({ products }) {
  const n = products.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const reduced = useRef(false);

  useEffect(() => { reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduced.current) setPlaying(false); }, []);
  useEffect(() => {
    if (!playing || hover || n < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 3600);
    return () => clearInterval(t);
  }, [playing, hover, n]);

  if (!n) return null;
  const go = (d) => setActive((a) => (a + d + n) % n);
  const cur = products[active];

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="cflow relative h-[400px] sm:h-[500px] lg:h-[560px]" role="group" aria-roledescription="carrusel" aria-label="Prendas destacadas">
        <div className="cflow-stage">
          {products.map((p, i) => {
            let off = i - active;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const style = {
              transform: `translate(-50%,-50%) translateX(${off * 58}%) translateZ(${-abs * 170}px) rotateY(${off * -34}deg) scale(${1 - abs * 0.04})`,
              opacity: abs > 2 ? 0 : 1 - abs * 0.22,
              zIndex: 10 - abs,
              pointerEvents: abs > 2 ? 'none' : 'auto',
              filter: abs ? `brightness(${1 - abs * 0.07})` : 'none',
            };
            const body = (
              <span className="relative block h-full w-full overflow-hidden rounded-lg bg-sand shadow-lift">
                {p.images[0] && <Image src={p.images[0]} alt={abs === 0 ? p.name : ''} fill sizes="300px" priority={i === 0} className="object-cover" />}
              </span>
            );
            return (
              <div key={p.id} className="cflow-item" style={style} aria-hidden={abs > 0 ? true : undefined}>
                {abs === 0 ? (
                  <Link href={`/producto/${p.id}`} className="block h-full w-full" tabIndex={0}>{body}</Link>
                ) : (
                  <button type="button" tabIndex={-1} onClick={() => setActive(i)} className="block h-full w-full" aria-label={`Ver ${p.name}`}>{body}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="min-w-0" aria-live="polite">
          <p className="truncate text-[15px] font-semibold">{cur.name}</p>
          <p className="text-[14px] text-ink-soft">{eur(cur.salePrice)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => go(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper transition-transform hover:border-ink active:scale-95" aria-label="Anterior"><ChevronLeft size={18} /></button>
          <button onClick={() => setPlaying((v) => !v)} className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:bg-sand active:scale-95" aria-label={playing ? 'Pausar el carrusel' : 'Reanudar el carrusel'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
          <button onClick={() => go(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper transition-transform hover:border-ink active:scale-95" aria-label="Siguiente"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
