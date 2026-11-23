// moda-enma-tienda/src/app/layout.js
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import './globals.css';
import Providers from '@/components/Providers';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import CookieNotice from '@/components/layout/CookieNotice';
import { SITE_CONFIG, siteUrl } from '@/site.config';

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_CONFIG.brand.name} · ${SITE_CONFIG.brand.tagline}`, template: `%s · ${SITE_CONFIG.brand.name}` },
  description: SITE_CONFIG.brand.description,
  openGraph: { type: 'website', locale: 'es_ES', siteName: SITE_CONFIG.brand.name, title: SITE_CONFIG.brand.name, description: SITE_CONFIG.brand.description },
  twitter: { card: 'summary_large_image' },
};

export const viewport = { themeColor: '#FAF6F0', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Store', name: SITE_CONFIG.brand.name, url: siteUrl(), description: SITE_CONFIG.brand.description, address: { '@type': 'PostalAddress', addressLocality: SITE_CONFIG.brand.city, addressCountry: 'ES' } }) }} />
        <a href="#contenido" className="sr-only z-[100] rounded-full bg-ink px-5 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
        <Providers>
          <AnnouncementBar />
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
          <CartDrawer />
          <CookieNotice />
        </Providers>
      </body>
    </html>
  );
}
