// moda-enma-tienda/src/app/sitemap.js
import { getAllProducts } from '@/lib/catalog.server';
import { DEPARTMENTS } from '@/lib/categories';
import { siteUrl } from '@/site.config';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = siteUrl();
  const products = await getAllProducts();
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    ...DEPARTMENTS.map((d) => ({ url: `${base}/${d.id}`, changeFrequency: 'daily', priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/producto/${p.id}`, changeFrequency: 'weekly', priority: 0.6 })),
    ...['envios-devoluciones', 'terminos-y-condiciones', 'privacidad', 'cookies', 'aviso-legal', 'contacto', 'sobre-nosotros'].map((s) => ({ url: `${base}/${s}`, changeFrequency: 'yearly', priority: 0.2 })),
  ];
}
