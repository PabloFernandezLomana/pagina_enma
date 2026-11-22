'use client';
// moda-enma-tienda/src/components/ui/ProductCard.js
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { eur } from '@/lib/format';
import { isSoldOut, isLastUnits } from '@/lib/productShape';

export default function ProductCard({ product, priority = false, sizes = '(min-width:1024px) 25vw, 50vw' }) {
  const { add } = useCart();
  const p = product;
  const soldOut = isSoldOut(p);
  const badge = soldOut ? 'Agotado' : p.tag || (isLastUnits(p) ? 'Últimas unidades' : '');
  const second = p.images[1];
  const available = p.variants.filter((v) => v.stock > 0);

  const quick = (size) => {
    const r = add(p, size, 1);
    if (r.ok) toast.success(`${p.name} (talla ${size}) en tu bolsa`);
  };

  return (
    <article className="group card-lift relative flex flex-col overflow-hidden rounded-lg bg-paper">
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: `rgb(var(--c-${p.department}, var(--c-sand)))` }}>
        <Link href={`/producto/${p.id}`} className="absolute inset-0 block" aria-label={`${p.name}, ${eur(p.salePrice)}`}>
          {p.images[0] && <Image src={p.images[0]} alt="" fill priority={priority} sizes={sizes} className={`zoom-img object-cover ${soldOut ? 'opacity-60' : ''}`} />}
          {second && <Image src={second} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
          {badge && (
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${soldOut ? 'bg-ink text-cream' : 'bg-paper text-ink'}`}>{badge}</span>
          )}
        </Link>
        {/* Añadir rápido: solo con ratón; en móvil se elige talla en la ficha */}
        {!soldOut && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:block">
            <div className="flex flex-wrap justify-center gap-1.5 rounded-full bg-paper/95 p-1.5 shadow-soft backdrop-blur">
              {available.slice(0, 6).map((v) => (
                <button key={v.size} onClick={() => quick(v.size)} className="min-h-[36px] min-w-[36px] rounded-full px-2.5 text-[12px] font-bold transition-[background-color,color,transform] hover:bg-ink hover:text-cream active:scale-95" aria-label={`Añadir talla ${v.size} a la bolsa`}>{v.size}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link href={`/producto/${p.id}`} className="flex flex-1 items-start justify-between gap-3 px-4 pb-4 pt-3.5" tabIndex={-1} aria-hidden>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug">{p.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-soft">{p.category}</p>
        </div>
        <p className="shrink-0 text-[15px] font-bold tabular-nums">{eur(p.salePrice)}</p>
      </Link>
    </article>
  );
}
