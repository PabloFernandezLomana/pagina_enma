'use client';
// moda-enma-tienda/src/components/layout/CartDrawer.js
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { eur } from '@/lib/format';
import { SITE_CONFIG } from '@/site.config';

export default function CartDrawer() {
  const { items, open, setOpen, remove, restore, setQty, subtotal, count } = useCart();
  const closeBtn = useRef(null);
  const panel = useRef(null);
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeBtn.current?.focus(), 60);
    const key = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('a[href],button:not([disabled])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => { clearTimeout(t); window.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open, setOpen]);

  const onRemove = (item) => {
    remove(item.key);
    toast(`${item.name} fuera de la bolsa`, { action: { label: 'Deshacer', onClick: () => restore(item) } });
  };
  const hasBuyable = items.some((i) => !i.soldOut);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside ref={panel} role="dialog" aria-modal="true" aria-label="Tu bolsa" inert={!open ? '' : undefined}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-paper shadow-lift transition-transform duration-[380ms] ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="font-display text-[26px] font-semibold">Tu bolsa {count > 0 && <span className="text-ink-soft">({count})</span>}</h2>
          <button ref={closeBtn} onClick={() => setOpen(false)} className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand" aria-label="Cerrar bolsa"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand"><ShoppingBag size={26} /></span>
            <p className="font-display text-[28px] font-medium leading-tight">Tu bolsa está vacía</p>
            <p className="text-[15px] text-ink-soft">Cuando algo te guste, aparecerá aquí.</p>
            <Link href="/mujer" onClick={() => setOpen(false)} className="btn btn-primary mt-2">Ver la tienda</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((it) => (
                <li key={it.key} className={`flex gap-4 py-5 ${it.soldOut ? 'opacity-60' : ''}`}>
                  <Link href={`/producto/${it.productId}`} onClick={() => setOpen(false)} className="relative h-28 w-[84px] shrink-0 overflow-hidden rounded-md bg-sand">
                    {it.image && <Image src={it.image} alt={it.name} fill sizes="84px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold">{it.name}</p>
                        <p className="text-[13px] text-ink-soft">Talla {it.size}</p>
                      </div>
                      <button onClick={() => onRemove(it)} className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-sand hover:text-ink" aria-label={`Quitar ${it.name}`}><X size={16} /></button>
                    </div>
                    {it.soldOut ? (
                      <p className="mt-auto text-[13px] font-semibold text-bad">Agotado: quítalo para continuar</p>
                    ) : (
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-line">
                          <button onClick={() => setQty(it.key, it.quantity - 1)} className="flex h-10 w-10 items-center justify-center" aria-label="Una menos"><Minus size={14} /></button>
                          <span className="w-6 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">{it.quantity}</span>
                          <button onClick={() => setQty(it.key, it.quantity + 1)} disabled={it.quantity >= (it.max || 10)} className="flex h-10 w-10 items-center justify-center disabled:opacity-30" aria-label="Una más"><Plus size={14} /></button>
                        </div>
                        <p className="text-[15px] font-semibold tabular-nums">{eur(it.price * it.quantity)}</p>
                      </div>
                    )}
                    {!it.soldOut && it.max > 0 && it.max <= 3 && <p className="mt-1 text-[12px] font-medium text-warn">Quedan {it.max}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 space-y-3 border-t border-line bg-cream px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-semibold">Subtotal</span>
                <span className="text-[20px] font-bold tabular-nums">{eur(subtotal)}</span>
              </div>
              <p className="text-[13px] leading-snug text-ink-soft">
                {SITE_CONFIG.legal.taxIncludedText}.{' '}
                {delivery.enabled && `Envío ${eur(delivery.cost)}`}
                {delivery.enabled && meetup.enabled && ' o '}
                {meetup.enabled && `quedamos en ${SITE_CONFIG.brand.city} sin coste`}. Lo eliges al pagar.
              </p>
              <Link href="/checkout" onClick={() => setOpen(false)} aria-disabled={!hasBuyable} className={`btn btn-primary w-full ${hasBuyable ? '' : 'pointer-events-none opacity-50'}`}>
                Tramitar pedido <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
