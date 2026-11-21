// moda-enma-tienda/src/app/sobre-nosotros/page.js
import Link from 'next/link';
import { SITE_CONFIG } from '@/site.config';

export const metadata = { title: 'Quiénes somos' };

export default function AboutPage() {
  return (
    <section className="wrap max-w-[800px] py-12 sm:py-16">
      <p className="eyebrow">Quiénes somos</p>
      <h1 className="h-display mt-2 text-[clamp(40px,6vw,72px)]">Una tienda pequeña de {SITE_CONFIG.brand.city}</h1>
      <div className="mt-8 space-y-5 text-[18px] leading-relaxed text-ink/85">
        <p>{SITE_CONFIG.brand.name} vende ropa, prendas deportivas y accesorios para mujer, hombre y niños. Elegimos pocas piezas y mostramos cuántas quedan de cada talla.</p>
        <p>Puedes recibirlo en casa o quedar con nosotros en {SITE_CONFIG.brand.city}. Pagas con PayPal o, si quedamos, en mano.</p>
        <p>Si tienes dudas, escríbenos desde la página de <Link className="underline underline-offset-2" href="/contacto">contacto</Link>.</p>
      </div>
    </section>
  );
}
