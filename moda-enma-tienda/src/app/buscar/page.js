// moda-enma-tienda/src/app/buscar/page.js
import { getProducts, catalogUnavailable } from '@/lib/catalog.server';
import CatalogDown from '@/components/ui/CatalogDown';
import LiveGrid from '@/components/ui/LiveGrid';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Buscar', robots: { index: false } };

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const q = (searchParams?.q || '').toString().slice(0, 80);
  const products = await getProducts({ search: q });
  if (!products.length && catalogUnavailable()) return <CatalogDown />;
  return (
    <section className="wrap py-12 sm:py-16">
      <h1 className="h-display text-[clamp(40px,6vw,72px)]">{q ? <>Resultados para “{q}”</> : 'Toda la tienda'}</h1>
      <p className="mb-10 mt-3 text-[16px] text-ink-soft">{products.length} {products.length === 1 ? 'artículo' : 'artículos'}</p>
      <LiveGrid initial={products} filters={products.length > 3} emptyText={q ? 'No hemos encontrado nada con esa búsqueda. Prueba con otra palabra, por ejemplo “vestido” o “botella”.' : 'Todavía no hay artículos.'} />
    </section>
  );
}
