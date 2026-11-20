import Link from 'next/link';

export const metadata = {
  title: 'Política de Cookies | ModaEnma',
  description: 'Uso de cookies técnicas en ModaEnma Boutique.'
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-warm-border pb-6">
        <span className="text-editorial-sub">TRANSPARENCIA DIGITAL</span>
        <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight mt-1">
          Política de Cookies
        </h1>
        <p className="text-xs text-warm-muted mt-2">Versión 1.0 — Noviembre 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-warm-muted space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">1. ¿Qué son las Cookies?</h2>
          <p>
            Una cookie es un pequeño archivo que se almacena en su navegador al visitar determinadas páginas web.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-warm-dark uppercase tracking-editorial">2. Cookies Utilizadas en este Sitio</h2>
          <p>
            ModaEnma utiliza únicamente <strong>cookies técnicas y funcionales estrictamente esenciales</strong> para el funcionamiento de la bolsa de compra y la persistencia temporal de la sesión del usuario. No se emplean cookies de seguimiento publicitario ni analítica intrusiva de terceros en la tienda pública.
          </p>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse border border-warm-border text-xs">
              <thead>
                <tr className="bg-warm-sand">
                  <th className="p-2 border border-warm-border font-bold">Cookie / Almacenamiento</th>
                  <th className="p-2 border border-warm-border font-bold">Tipo</th>
                  <th className="p-2 border border-warm-border font-bold">Finalidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-warm-border font-mono">modainma_cart</td>
                  <td className="p-2 border border-warm-border">Técnica (Local)</td>
                  <td className="p-2 border border-warm-border">Mantener los productos seleccionados en la bolsa durante la navegación.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="pt-6 border-t border-warm-border">
        <Link href="/" className="text-xs font-bold tracking-editorial uppercase text-brand-terracotta hover:underline">
          ← Volver a la Tienda
        </Link>
      </div>
    </div>
  );
}

