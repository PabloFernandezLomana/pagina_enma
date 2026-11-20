'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CATEGORIES } from '@/lib/mockCatalog';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-warm-border/60 ${
      isScrolled ? 'py-3.5 shadow-xs' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle + Desktop Nav Category Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-warm-dark hover:text-brand-terracotta transition-colors p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-xs font-semibold tracking-editorial uppercase transition-colors relative py-1 ${
                pathname === '/' ? 'text-warm-dark font-bold' : 'text-warm-muted hover:text-warm-dark'
              }`}
            >
              Inicio
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-terracotta rounded-full" />
              )}
            </Link>
            {CATEGORIES.map((cat) => {
              const isActive = pathname === `/${cat.id}`;
              return (
                <div key={cat.id} className="relative group py-2">
                  <Link
                    href={`/${cat.id}`}
                    className={`text-xs font-semibold tracking-editorial uppercase transition-colors relative py-1 ${
                      isActive ? 'text-warm-dark font-bold' : 'text-warm-muted hover:text-warm-dark'
                    }`}
                  >
                    {cat.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-terracotta rounded-full" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Center: Brand Logo (Zara / Mango Luxury Typography) */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl sm:text-3xl font-normal tracking-[0.22em] text-warm-dark block uppercase leading-none">
              ModaEnma
            </span>
            <span className="text-[9px] tracking-[0.38em] uppercase text-warm-muted block mt-1 font-semibold">
              Boutique Store
            </span>
          </Link>
        </div>

        {/* Right: Search + Cart Icon */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-warm-dark hover:text-brand-terracotta transition-colors p-1 flex items-center gap-2"
            aria-label="Buscar"
          >
            <Search size={19} />
            <span className="hidden sm:inline text-[11px] uppercase tracking-editorial text-warm-muted font-medium">
              Buscar
            </span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-warm-dark hover:text-brand-terracotta transition-colors p-1 flex items-center gap-1.5"
            aria-label="Carrito"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-terracotta text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="hidden sm:inline text-xs font-semibold tracking-wider ml-1">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Quick Search Overlay */}
      {searchOpen && (
        <div className="w-full bg-white/95 backdrop-blur-xl border-t border-warm-border px-4 py-4 animate-fade-in shadow-md">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar vestidos, blusas, abrigos, botellas metálicas, deporte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-warm-sand/80 border border-warm-border rounded-full py-2.5 pl-12 pr-10 text-sm text-warm-dark placeholder-warm-muted focus:outline-none focus:border-brand-terracotta transition-colors"
              />
              <Search size={18} className="absolute left-4 text-warm-muted" />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 text-warm-muted hover:text-warm-dark p-1"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] bg-[#fcfbf9]/98 backdrop-blur-2xl z-40 px-6 py-8 flex flex-col justify-between animate-fade-in border-t border-warm-border">
          <div className="space-y-6">
            <span className="text-[10px] tracking-editorial uppercase text-warm-muted font-bold block mb-4">
              Navegación
            </span>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-lg font-display text-warm-dark border-b border-warm-border pb-3 font-semibold"
            >
              <span>Inicio</span>
              <ChevronRight size={16} className="text-warm-muted" />
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-lg font-display text-warm-dark border-b border-warm-border pb-3"
              >
                <span>{cat.name}</span>
                <ChevronRight size={16} className="text-warm-muted" />
              </Link>
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t border-warm-border">
            <Link
              href="/sobre-nosotros"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-editorial text-warm-muted hover:text-warm-dark"
            >
              Sobre la Marca
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-editorial text-warm-muted hover:text-warm-dark"
            >
              Contacto Boutique
            </Link>
            <Link
              href="/envios-devoluciones"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-editorial text-warm-muted hover:text-warm-dark"
            >
              Envíos & Devoluciones
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
