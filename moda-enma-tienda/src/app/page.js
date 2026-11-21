// moda-enma-tienda/src/app/page.js
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllProducts } from '@/lib/catalog.server';
import { DEPARTMENTS } from '@/lib/categories';
import { eur } from '@/lib/format';
import { SITE_CONFIG } from '@/site.config';
import CoverFlow from '@/components/home/CoverFlow';
import FloatingPick from '@/components/home/FloatingPick';
import Tilt3D from '@/components/home/Tilt3D';
import Reveal from '@/components/ui/Reveal';
import LiveGrid from '@/components/ui/LiveGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const all = await getAllProducts();
  const featured = all.filter((p) => p.featured && p.images[0]);
  const hero = (featured.length >= 3 ? featured : all.filter((p) => p.images[0])).slice(0, 6);
  const latest = [...all].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 8);
  const bottle = all.find((p) => p.department === 'accesorios' && p.featured) || all.find((p) => p.department === 'accesorios');
  const { delivery, meetup } = SITE_CONFIG.shipping.methods;
  const byDept = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, all.filter((p) => p.department === d.id)]));

  const picks = [
    hero[0] && { sectionId: 'portada', label: 'Para empezar', product: hero[0] },
    byDept.mujer?.[0] && { sectionId: 'secciones', label: 'Mujer', product: byDept.mujer[0] },
    latest[1] && { sectionId: 'novedades', label: 'Novedad', product: latest[1] },
    bottle && { sectionId: 'pieza', label: 'Pieza del mes', product: bottle },
  ].filter(Boolean);

  return (
    <>
      <section id="portada" className="relative overflow-hidden">
        <div className="wrap grid items-center gap-8 pb-10 pt-8 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:py-8">
          <div className="relative z-10 max-w-[620px]">
            <p className="eyebrow enter" style={{ '--d': '0ms' }}>Tienda online de {SITE_CONFIG.brand.city}</p>
            <h1 className="h-display enter mt-4 text-[clamp(46px,7.4vw,98px)]" style={{ '--d': '80ms' }}>
              Ropa, deporte y accesorios <em className="text-terracotta-deep">para toda la familia.</em>
            </h1>
            <p className="enter mt-6 max-w-[48ch] text-[17px] leading-relaxed text-ink-soft" style={{ '--d': '180ms' }}>
              Pocas prendas, bien elegidas. Compra aquí
              {delivery.enabled && ` y recíbelo en casa por ${eur(delivery.cost)}`}
              {meetup.enabled && (delivery.enabled ? ', o quedamos en ' : ' y quedamos en ') }
              {meetup.enabled && `${SITE_CONFIG.brand.city}.`}
            </p>
            <div className="enter mt-8 flex flex-wrap gap-3" style={{ '--d': '280ms' }}>
              <a href="#novedades" className="btn btn-primary">Ver las novedades <ArrowRight size={16} /></a>
              <a href="#como-comprar" className="btn btn-ghost">Cómo comprar</a>
            </div>
          </div>
          <div className="enter relative" style={{ '--d': '200ms' }}>
            <div className="absolute left-1/2 top-[44%] -z-0 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta-soft" aria-hidden />
            <div className="relative z-10"><CoverFlow products={hero} /></div>
          </div>
        </div>
      </section>

      <section id="secciones" className="wrap py-20 lg:py-24">
        <Reveal><h2 className="h-display text-[clamp(36px,5vw,64px)]">Elige tu sección</h2></Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12">
          {DEPARTMENTS.map((d, i) => {
            const img = byDept[d.id]?.[0]?.images[0];
            const span = i === 0 ? 'lg:col-span-7' : i === 1 ? 'lg:col-span-5' : 'lg:col-span-4';
            return (
              <Reveal key={d.id} delay={i * 70} className={`${span} ${i === 0 ? 'col-span-2' : ''}`}>
                <Link href={`/${d.id}`} className="group card-lift relative block aspect-[5/4] overflow-hidden rounded-lg sm:aspect-[16/10] lg:aspect-auto lg:h-[440px]" style={{ backgroundColor: `rgb(var(--c-${d.tint}))` }}>
                  {img && <Image src={img} alt="" fill sizes="(min-width:1024px) 40vw, 50vw" className="zoom-img object-cover object-center" />}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
                    <div>
                      <h3 className="font-display text-[clamp(30px,4vw,48px)] font-medium leading-none">{d.name}</h3>
                      <p className="mt-2 hidden max-w-[24ch] text-[14px] text-ink/75 sm:block">{d.desc}</p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={18} /></span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="novedades" className="wrap py-16 lg:py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-display text-[clamp(36px,5vw,64px)]">Lo último</h2>
          <Link href="/buscar" className="link-draw inline-flex min-h-[44px] items-center gap-2 text-[14px] font-semibold">Ver toda la tienda <ArrowRight size={15} /></Link>
        </Reveal>
        <LiveGrid initial={latest} filters={false} emptyText="Estamos preparando la primera colección. Vuelve muy pronto." />
      </section>

      {bottle && (
        <section id="pieza" className="wrap py-16 lg:py-20">
          <Reveal className="grid items-center gap-8 overflow-hidden rounded-lg bg-tint-accesorios p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
            <div>
              <p className="eyebrow">Pieza del mes</p>
              <h2 className="h-display mt-3 text-[clamp(36px,5vw,64px)]">{bottle.name}</h2>
              <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink/80">{bottle.description}</p>
              <p className="mt-6 text-[22px] font-bold">{eur(bottle.salePrice)}</p>
              <Link href={`/producto/${bottle.id}`} className="btn btn-ink mt-6">Verla <ArrowRight size={16} /></Link>
            </div>
            <Tilt3D className="mx-auto aspect-[3/4] w-full max-w-[380px]">
              <div className="relative h-full w-full overflow-hidden rounded-lg shadow-lift">
                {bottle.images[0] && <Image src={bottle.images[0]} alt={bottle.name} fill sizes="380px" className="object-cover" />}
              </div>
            </Tilt3D>
          </Reveal>
        </section>
      )}

      <section id="como-comprar" className="wrap py-16 lg:py-24">
        <Reveal><h2 className="h-display text-[clamp(36px,5vw,64px)]">Comprar es fácil</h2></Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Elige tu talla', 'En cada prenda ves cuántas unidades quedan de cada talla, en tiempo real.'],
            ['2', 'Paga como prefieras', meetup.enabled ? 'Con PayPal, o en mano si quedamos en persona.' : 'Con PayPal, en un paso.'],
            ['3', 'Recíbelo o quedamos', `${delivery.enabled ? `En casa en 2-4 días laborables por ${eur(delivery.cost)}` : ''}${delivery.enabled && meetup.enabled ? ', o ' : ''}${meetup.enabled ? `quedamos en ${SITE_CONFIG.brand.city} sin coste` : ''}.`],
          ].map(([n, t, d], i) => (
            <Reveal as="li" key={n} delay={i * 90} className="rounded-lg border border-line bg-paper p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-soft font-display text-[22px] font-semibold text-terracotta-deep">{n}</span>
              <h3 className="mt-5 text-[19px] font-bold">{t}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <FloatingPick picks={picks} />
    </>
  );
}
