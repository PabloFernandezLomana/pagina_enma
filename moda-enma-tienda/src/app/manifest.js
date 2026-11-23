// moda-enma-tienda/src/app/manifest.js — Next lo sirve como /manifest.webmanifest
export default function manifest() {
  return {
    name: 'ModaEnma',
    short_name: 'ModaEnma',
    description: 'Moda y accesorios para toda la familia, desde Málaga.',
    start_url: '/',
    display: 'standalone',
    lang: 'es',
    background_color: '#FAF6F0',
    theme_color: '#FAF6F0',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
