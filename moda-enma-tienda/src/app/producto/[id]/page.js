// moda-enma-tienda/src/app/producto/[id]/page.js
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/catalog.server';
import { SITE_CONFIG, siteUrl } from '@/site.config';
import ProductDetailClient from './ProductDetailClient';
import TrackView from '@/components/ui/TrackView';
import ProductCard from '@/components/ui/ProductCard';
import { totalStock } from '@/lib/productShape';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: 'Producto no encontrado', robots: { index: false } };
  const desc = p.description.slice(0, 155) || SITE_CONFIG.brand.description;
  return {
    title: p.name, description: desc, alternates: { canonical: `/producto/${p.id}` },
    openGraph: { title: p.name, description: desc, images: p.images[0] ? [{ url: p.images[0] }] : undefined },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const related = (await getProducts({ department: product.department })).filter((p) => p.id !== product.id).slice(0, 4);

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description,
    sku: product.sku || undefined, image: product.images.map((i) => (i.startsWith('http') ? i : `${siteUrl()}${i}`)),
    offers: {
      '@type': 'Offer', priceCurrency: 'EUR', price: product.salePrice.toFixed(2),
      availability: totalStock(product) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteUrl()}/producto/${product.id}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <TrackView productId={product.id} />
      <ProductDetailClient initial={product} />
      {related.length > 0 && (
        <section className="wrap pb-10 pt-6">
          <h2 className="h-display mb-8 text-[clamp(32px,4vw,52px)]">Completa el look</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
