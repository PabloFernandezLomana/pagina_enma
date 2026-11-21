// moda-enma-tienda/src/app/not-found.js
import Link from 'next/link';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="h-display mt-3 text-[clamp(48px,8vw,96px)]">Esta página no existe</h1>
      <p className="mt-4 max-w-[44ch] text-[17px] text-ink-soft">Puede que la prenda ya no esté o que el enlace tenga un error.</p>
      <Link href="/buscar" className="btn btn-primary mt-8">Ver toda la tienda</Link>
    </section>
  );
}
