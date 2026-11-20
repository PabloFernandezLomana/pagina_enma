import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, Sparkles, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import MarqueeBar from '@/components/animations/MarqueeBar';
import { getProducts } from '@/lib/productService';
import { CATEGORIES } from '@/lib/mockCatalog';

export default async function HomePage({ searchParams }) {
  const search = searchParams?.search || '';
  const products = await getProducts({ search });
  const featuredSelection = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-warm-dark overflow-hidden">
      
      {/* 1. HERO EDITORIAL INMERSIVO DE ALTO IMPACTO (Estilo Zara / Massimo Dutti) */}
      <section className="relative min-h-[92vh] flex items-end pb-16 px-4 sm:px-8 lg:px-12 border-b border-warm-border">
        {/* Imagen de fondo a sangre completa */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="ModaEnma Boutique Málaga Colección Cápsula"
            fill
            priority
            className="object-cover object-top filter brightness-[0.88] contrast-[1.02]"
            sizes="100vw"
          />
          {/* Degradados editoriales */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block" />
        </div>

        {/* Contenido flotante sobre la imagen */}
        <div className="relative z-10 max-w-5xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-bold tracking-[0.25em] uppercase text-white shadow-md">
            <Sparkles size={14} className="text-amber-300" />
            <span>Colección 2026 • ModaEnma Málaga</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight uppercase leading-[0.92] text-white text-shadow-sm">
              Elegancia <br />
              <span className="italic font-normal">Contemporánea</span>
            </h1>
            <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-xl font-light leading-relaxed tracking-wide pt-1">
              Prendas seleccionadas con criterio editorial para mujer, hombre, niños y accesorios exclusivos. Venta online directa en Málaga.
            </p>
          </div>

          {/* Botones de acción directa */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/mujer"
              className="px-9 py-4 bg-white text-warm-dark hover:bg-brand-terracotta hover:text-white font-bold text-xs tracking-editorial uppercase transition-all duration-300 rounded-xs flex items-center gap-2 shadow-lg active:scale-98"
            >
              <span>Ver Colección Mujer</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/hombre"
              className="px-9 py-4 bg-black/40 backdrop-blur-md border border-white/40 text-white hover:bg-white hover:text-warm-dark font-bold text-xs tracking-editorial uppercase transition-all duration-300 rounded-xs flex items-center gap-2 shadow-sm"
            >
              <span>Hombre</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Banda de Confianza y Transparencia */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 max-w-lg text-white/90">
            <div>
              <span className="font-display text-2xl font-light block">Málaga</span>
              <span className="text-[10px] tracking-editorial uppercase text-white/70 font-semibold">Reparto Local Exclusivo</span>
            </div>
            <div>
              <span className="font-display text-2xl font-light block">14 Días</span>
              <span className="text-[10px] tracking-editorial uppercase text-white/70 font-semibold">Garantía Devolución</span>
            </div>
            <div>
              <span className="font-display text-2xl font-light block">En Mano / PayPal</span>
              <span className="text-[10px] tracking-editorial uppercase text-white/70 font-semibold">Pago Seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CINTA EDITORIAL EN MOVIMIENTO */}
      <MarqueeBar />

      {/* 3. BLOQUES DE CATEGORÍAS EDITORIALES GRANDES (Estilo Zara Cuadrícula Moda) */}
      <section className="py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-warm-border pb-6">
          <div>
            <span className="text-editorial-sub">CATEGORÍAS ESENCIALES</span>
            <h2 className="font-display text-3xl sm:text-5xl font-light uppercase tracking-tight text-warm-dark mt-1">
              Explora por Secciones
            </h2>
          </div>
          <p className="text-xs text-warm-muted max-w-md">
            Diseño, cortes estructurados y tejidos nobles preparados para acompañar tu día a día.
          </p>
        </div>

        {/* Grid de Secciones con Aspect Ratio Vertical Editorial */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {CATEGORIES.map((cat, idx) => {
            const categoryImages = {
              mujer: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=85",
              hombre: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
              ninos: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85",
              deporte: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=85",
              accesorios: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85",
            };

            return (
              <Link
                key={cat.id}
                href={`/${cat.id}`}
                className="group relative aspect-[3/4] sm:aspect-[2/3] rounded-sm overflow-hidden border border-warm-border bg-warm-sand block shadow-xs"
              >
                <Image
                  src={categoryImages[cat.id]}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-white">
                  <span className="text-[10px] font-bold tracking-editorial uppercase text-white/70">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-light tracking-wide uppercase group-hover:translate-x-1 transition-transform">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-semibold tracking-editorial uppercase text-brand-terracottaLight mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
                      Descubrir →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. LOOKBOOK / CAMPAÑA EDITORIAL (Bloque Estilo Revista Zara) */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-warm-border rounded-xl p-6 sm:p-12 shadow-xs">
          <div className="md:col-span-5 space-y-6">
            <span className="text-editorial-sub">EDICIÓN LIMITADA</span>
            <h2 className="font-display text-3xl sm:text-5xl font-light uppercase tracking-tight text-warm-dark leading-tight">
              Prendas que <br />
              <span className="italic font-normal">respiran calma</span>
            </h2>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed font-light">
              Nuestra propuesta combina siluetas fluidas en seda, lino puro y lanas sutiles. Piezas atemporales pensadas para perdurar en tu armario temporada tras temporada.
            </p>
            <div className="pt-2">
              <Link
                href="/mujer"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-terracotta text-white font-bold text-xs tracking-editorial uppercase hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-md"
              >
                <span>Explorar Lookbook</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-warm-border">
              <Image
                src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85"
                alt="Vestido Midi Lino Floral"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 30vw"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-warm-border mt-6">
              <Image
                src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=85"
                alt="Blazer Estructurada Sarga Lana"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 30vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELECCIÓN DE PRODUCTOS (Rejilla de 2 columnas en móvil y 4 en desktop) */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-warm-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-editorial-sub">CATÁLOGO VIVO</span>
            <h2 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight text-warm-dark mt-1">
              Novedades de Temporada
            </h2>
          </div>
          <Link
            href="/mujer"
            className="text-xs font-bold tracking-editorial uppercase text-brand-terracotta hover:text-brand-terracottaDark transition-colors flex items-center gap-1.5"
          >
            <span>Ver Toda la Colección</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {featuredSelection.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. PIEZA ICÓNICA & ACCESORIOS */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto bg-white rounded-2xl border border-warm-border my-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-editorial-sub">PIEZA ICÓNICA</span>
            <h2 className="font-display text-3xl sm:text-5xl font-light uppercase tracking-tight text-warm-dark">
              Botella Térmica Pro 750ml
            </h2>
            <p className="text-sm text-warm-muted font-light leading-relaxed">
              Doble pared en acero inoxidable quirúrgico 18/8 con acabado metálico cepillado. Mantiene las bebidas frías 24h o calientes 12h con total durabilidad y estilo.
            </p>

            <div className="space-y-3 pt-2 text-xs text-warm-dark">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-brand-terracotta" />
                <span>Acero Inoxidable Quirúrgico 18/8 de grado alimentario</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-brand-terracotta" />
                <span>Reparto local en Málaga • Pago en mano disponible</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/producto/prod-enma-07"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-terracotta text-white text-xs font-bold tracking-editorial uppercase hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-md"
              >
                <span>Ver Detalles de la Botella</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-square rounded-xl overflow-hidden border border-warm-border bg-warm-sand">
            <Image
              src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85"
              alt="Botella Térmica Metalizada Pro 750ml"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
