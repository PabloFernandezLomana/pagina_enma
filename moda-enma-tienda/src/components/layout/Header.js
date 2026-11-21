'use client';
// moda-enma-tienda/src/components/layout/Header.js
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DEPARTMENTS } from '@/lib/categories';
import { SITE_CONFIG } from '@/site.config';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, openCart } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const [stuck, setStuck] = useState(false);
  const input = useRef(null);

  useEffect(() => { setMenu(false); setSearch(false); }, [pathname]);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    const esc = (e) => { if (e.key === 'Escape') { setMenu(false); setSearch(false); } };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [menu]);
  useEffect(() => { if (search) input.current?.focus(); }, [search]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className={`sticky top-0 z-40 border-b bg-cream/92 backdrop-blur-md transition-shadow duration-300 ${stuck ? 'border-line shadow-soft' : 'border-transparent'}`}>
      <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center sm:h-[72px]">
        <div className="flex items-center gap-1">
          <button className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menú" aria-expanded={menu}>
            <Menu size={22} />
          </button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
            {DEPARTMENTS.map((d) => {
              const active = pathname === `/${d.id}`;
              return (
                <Link key={d.id} href={`/${d.id}`} className={`link-draw py-2 text-[13px] font-semibold tracking-wide ${active ? 'text-terracotta-deep' : 'text-ink'}`} aria-current={active ? 'page' : undefined}>
                  {d.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link href="/" className="text-center" aria-label={`${SITE_CONFIG.brand.name}, inicio`}>
          <span className="font-display text-[28px] font-semibold leading-none tracking-[0.04em] sm:text-[32px]">
            Moda<span className="text-terracotta">Enma</span>
          </span>
        </Link>

        <div className="flex items-center justify-end gap-0.5">
          <button className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-sand" onClick={() => setSearch((s) => !s)} aria-label="Buscar" aria-expanded={search}>
            <Search size={20} />
          </button>
          <button className="relative -mr-2 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-sand" onClick={openCart} aria-label={`Abrir bolsa, ${count} artículos`}>
            <ShoppingBag size={21} />
            {count > 0 && (
              <span key={count} className="absolute right-1 top-1.5 flex h-[18px] min-w-[18px] animate-[rise_0.3s_var(--ease-out)] items-center justify-center rounded-full bg-terracotta-deep px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {search && (
        <div className="border-t border-line bg-paper">
          <form onSubmit={submit} className="wrap flex items-center gap-3 py-3" role="search">
            <Search size={18} className="shrink-0 text-ink-soft" aria-hidden />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} type="search" enterKeyHint="search" placeholder="Busca un vestido, una botella, unas mallas…" aria-label="Buscar en la tienda" className="h-11 w-full bg-transparent text-base placeholder:text-ink-soft/70 focus:outline-none" />
            <button type="button" onClick={() => setSearch(false)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand" aria-label="Cerrar búsqueda"><X size={18} /></button>
          </form>
        </div>
      )}

      {/* Menú móvil a pantalla completa */}
      <div className={`fixed inset-0 z-50 bg-cream transition-[opacity,visibility] duration-300 lg:hidden ${menu ? 'visible opacity-100' : 'invisible opacity-0'}`} role="dialog" aria-modal="true" aria-label="Menú" inert={!menu ? '' : undefined}>
        <div className="wrap flex h-16 items-center justify-between">
          <span className="font-display text-[28px] font-semibold">Moda<span className="text-terracotta">Enma</span></span>
          <button className="-mr-3 flex h-12 w-12 items-center justify-center rounded-full" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X size={22} /></button>
        </div>
        <div className="wrap space-y-2.5 pb-10 pt-3">
          {DEPARTMENTS.map((d, i) => (
            <Link key={d.id} href={`/${d.id}`} style={{ backgroundColor: `rgb(var(--c-${d.tint}))`, transitionDelay: menu ? `${60 + i * 45}ms` : '0ms' }} className={`flex min-h-[64px] items-center justify-between rounded-lg px-5 font-display text-[28px] font-medium transition-[transform,opacity] duration-500 ease-out ${menu ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
              {d.name}
              <ArrowRight size={20} />
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-6 text-[15px]">
            <Link href="/envios-devoluciones" className="py-3 font-medium">Envíos y devoluciones</Link>
            <Link href="/contacto" className="py-3 font-medium">Contacto</Link>
            <Link href="/sobre-nosotros" className="py-3 font-medium">Quiénes somos</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
