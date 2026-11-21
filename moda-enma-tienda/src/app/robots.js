// moda-enma-tienda/src/app/robots.js
import { siteUrl } from '@/site.config';

export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/pedido/'] }], sitemap: `${siteUrl()}/sitemap.xml` };
}
