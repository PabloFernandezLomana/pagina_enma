// moda-enma-tienda/src/components/ui/CatalogDown.js
// Se muestra cuando no se ha podido leer el catálogo (no es lo mismo que "no hay prendas").
import { SITE_CONFIG, whatsappLink } from '@/site.config';

export default function CatalogDown() {
  const wa = whatsappLink('Hola, la web no me carga los artículos. ¿Me ayudas?');
  return (
    <section className="wrap flex min-h-[50vh] flex-col items-center justify-center py-20 text-center" role="status">
      <p className="eyebrow">Un momento</p>
      <h1 className="h-display mt-3 text-[clamp(36px,6vw,72px)]">Estamos actualizando la tienda</h1>
      <p className="mt-4 max-w-[46ch] text-[17px] text-ink-soft">No hemos podido cargar los artículos ahora mismo. Recarga la página en unos segundos; tus prendas siguen aquí.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="" className="btn btn-primary">Recargar</a>
        {wa && <a href={wa} className="btn" target="_blank" rel="noopener noreferrer">Escribirnos por WhatsApp</a>}
      </div>
      <p className="mt-6 text-[13px] text-ink-soft">{SITE_CONFIG.brand.name}</p>
    </section>
  );
}
