// moda-enma-tienda/src/app/[category]/page.js
import { notFound } from 'next/navigation';
import { getProducts, catalogUnavailable } from '@/lib/catalog.server';
import CatalogDown from '@/components/ui/CatalogDown';
import { DEPARTMENTS, getDepartment } from '@/lib/categories';
import LiveGrid from '@/components/ui/LiveGrid';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const d = getDepartment(category);
  return d ? { title: d.name, description: d.desc, alternates: { canonical: `/${d.id}` } } : {};
}

export default async function DepartmentPage({ params }) {
  const { category } = await params;
  const dep = getDepartment(category);
  if (!dep) notFound();
  const products = await getProducts({ department: dep.id });
  if (!products.length && catalogUnavailable()) return <CatalogDown />;

  return (
    <>
      <section style={{ backgroundColor: `rgb(var(--c-${dep.tint}))` }}>
        <div className="wrap py-12 sm:py-16">
          <nav aria-label="Migas de pan" className="text-[13px] font-medium text-ink/70"><a href="/" className="link-draw">Inicio</a> / {dep.name}</nav>
          <h1 className="h-display mt-3 text-[clamp(48px,8vw,104px)]">{dep.name}</h1>
          <p className="mt-3 max-w-[50ch] text-[17px] text-ink/80">{dep.desc} <span className="font-semibold">{products.length} {products.length === 1 ? 'artículo' : 'artículos'}.</span></p>
        </div>
      </section>
      <section className="wrap py-10 sm:py-14">
        <LiveGrid initial={products} department={dep.id} emptyText={`Pronto habrá novedades en ${dep.name}.`} />
      </section>
    </>
  );
}
