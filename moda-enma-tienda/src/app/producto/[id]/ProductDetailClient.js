'use client';
// moda-enma-tienda/src/app/producto/[id]/ProductDetailClient.js
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShoppingBag, Truck, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getClientFirestore } from '@/lib/firebase.client';
import { toPublicProduct, totalStock } from '@/lib/productShape';
import { getDepartment } from '@/lib/categories';
import { eur } from '@/lib/format';
import { SITE_CONFIG } from '@/site.config';

export default function ProductDetailClient({ initial }) {
  const { add } = useCart();
  const [p, setP] = useState(initial);
  const [size, setSize] = useState('');
  const [img, setImg] = useState(0);
  const [pulse, setPulse] = useState(0);
  const galleryRef = useRef(null);
  const dep = getDepartment(p.department);
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;

  // Stock en tiempo real: si cambias el stock en el panel, esta ficha se actualiza sola.
  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    getClientFirestore().then((c) => {
      if (!c || cancelled) return;
      const { db, fs } = c;
      unsub = fs.onSnapshot(fs.doc(db, 'products', initial.id), (s) => { if (s.exists() && s.data().active) setP(toPublicProduct(s.id, s.data())); }, () => {});
    });
    return () => { cancelled = true; unsub(); };
  }, [initial.id]);

  const variant = p.variants.find((v) => v.size === size);
  const soldOut = totalStock(p) === 0;
  const ready = Boolean(variant && variant.stock > 0);

  const addToBag = () => {
    if (!size) { toast('Elige una talla primero'); setPulse((n) => n + 1); return; }
    const r = add(p, size, 1);
    if (!r.ok) return toast.error('Esa talla se acaba de agotar');
    if (r.capped) toast('Ya tienes todas las unidades disponibles en la bolsa');
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'cart', productId: p.id }), keepalive: true }).catch(() => {});
  };

  const onScroll = (e) => { const el = e.currentTarget; setImg(Math.round(el.scrollLeft / el.clientWidth)); };
  const goTo = (i) => { setImg(i); galleryRef.current?.scrollTo({ left: i * galleryRef.current.clientWidth, behavior: 'smooth' }); };

  return (
    <div className="wrap pb-16 pt-6 sm:pt-10">
      <nav aria-label="Migas de pan" className="mb-6 text-[13px] font-medium text-ink-soft">
        <Link href="/" className="link-draw">Inicio</Link> / {dep && <><Link href={`/${dep.id}`} className="link-draw">{dep.name}</Link> / </>}<span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className={`grid gap-3 ${p.images.length > 1 ? 'lg:grid-cols-[84px_1fr]' : ''}`}>
            {p.images.length > 1 && (
              <div className="order-2 hidden flex-col gap-3 lg:order-1 lg:flex" role="tablist" aria-label="Fotos">
                {p.images.map((src, i) => (
                  <button key={src} role="tab" aria-selected={img === i} onClick={() => goTo(i)} className={`relative aspect-[3/4] overflow-hidden rounded-md bg-sand ring-2 transition-[box-shadow,opacity] ${img === i ? 'opacity-100 ring-ink' : 'opacity-70 ring-transparent hover:opacity-100'}`}>
                    <Image src={src} alt={`Foto ${i + 1}`} fill sizes="84px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="order-1 lg:order-2">
              <div ref={galleryRef} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-hidden" style={{ backgroundColor: `rgb(var(--c-${p.department}))` }}>
                {p.images.map((src, i) => (
                  <div key={src} className={`relative aspect-[3/4] w-full shrink-0 snap-center ${i === img ? '' : 'lg:hidden'}`}>
                    <Image src={src} alt={i === 0 ? p.name : `${p.name}, foto ${i + 1}`} fill priority={i === 0} sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
              {p.images.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
                  {p.images.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${img === i ? 'w-5 bg-ink' : 'w-1.5 bg-ink/25'}`} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">{p.category}{p.sku ? ` · Ref. ${p.sku}` : ''}</p>
          <h1 className="h-display mt-2 text-[clamp(38px,5vw,64px)]">{p.name}</h1>
          <p className="mt-4 flex items-baseline gap-3"><span className="text-[28px] font-bold tabular-nums">{eur(p.salePrice)}</span><span className="text-[13px] text-ink-soft">{SITE_CONFIG.legal.taxIncludedText}</span></p>
          {p.description && <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-ink/85">{p.description}</p>}

          <div className="mt-8" key={pulse} style={pulse ? { animation: 'rise .35s var(--ease-out)' } : undefined}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-bold">Talla</h2>
              <p className="text-[13px] font-medium" aria-live="polite">
                {variant ? (variant.stock <= 3 ? <span className="text-warn">Quedan {variant.stock}</span> : <span className="inline-flex items-center gap-1 text-ok"><Check size={14} /> Disponible</span>) : <span className="text-ink-soft">Elige una</span>}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Talla">
              {p.variants.map((v) => (
                <button key={v.size} role="radio" aria-checked={size === v.size} disabled={v.stock === 0} onClick={() => setSize(v.size)}
                  className={`relative min-h-[48px] min-w-[56px] rounded-full border px-5 text-[15px] font-bold transition-[background-color,color,border-color,transform] duration-150 active:scale-95 disabled:cursor-not-allowed ${size === v.size ? 'border-ink bg-ink text-cream' : v.stock === 0 ? 'border-line bg-sand/50 text-ink-soft/60 line-through' : 'border-line bg-paper hover:border-ink'}`}>
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 hidden gap-3 sm:flex">
            <button onClick={addToBag} disabled={soldOut} className="btn btn-primary flex-1 !min-h-[56px] text-[14px]">
              <ShoppingBag size={18} /> {soldOut ? 'Agotado' : ready ? 'Añadir a la bolsa' : 'Añadir a la bolsa'}
            </button>
          </div>

          <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-paper">
            <Info icon={Truck} title="Envío y pago">
              {delivery.enabled && <p>Envío a domicilio: {eur(delivery.cost)}, en 2-4 días laborables a {SITE_CONFIG.shipping.shipsTo}. Pago con PayPal.</p>}
              {meetup.enabled && <p className="mt-2">Quedar en persona en {SITE_CONFIG.brand.city}: sin coste, y pagas en mano o con PayPal.</p>}
            </Info>
            <Info icon={RotateCcw} title="Cambios y devoluciones">
              <p>Tienes {SITE_CONFIG.legal.withdrawalDays} días naturales para desistir de la compra desde que lo recibes. <Link href="/envios-devoluciones" className="underline underline-offset-2">Cómo hacerlo</Link>.</p>
            </Info>
          </ul>
        </div>
      </div>

      {/* Barra de compra fija en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] text-ink-soft">{p.name}</p><p className="text-[18px] font-bold tabular-nums">{eur(p.salePrice)}</p></div>
          <button onClick={addToBag} disabled={soldOut} className="btn btn-primary shrink-0">{soldOut ? 'Agotado' : size ? `Añadir · ${size}` : 'Elegir talla'}</button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, title, children }) {
  return (
    <li>
      <details className="group">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
          <Icon size={18} className="text-terracotta-deep" /> {title}
          <ChevronDown size={18} className="ml-auto transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink-soft">{children}</div>
      </details>
    </li>
  );
}
