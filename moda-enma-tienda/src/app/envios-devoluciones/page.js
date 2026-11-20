import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-editorial-sub">POLÍTICA DE SERVICIO</span>
        <h1 className="font-display text-4xl sm:text-6xl font-light uppercase tracking-tight text-warm-dark">
          Envíos & Devoluciones
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted font-light max-w-xl mx-auto leading-relaxed">
          Garantizamos entregas rápidas y un proceso de devolución sencillo para que compres con total tranquilidad.
        </p>
      </div>

      <div className="space-y-8 text-xs text-warm-muted font-light leading-relaxed">
        <div className="bg-warm-card border border-warm-border p-6 rounded-xs space-y-3 shadow-xs">
          <div className="flex items-center gap-3 text-warm-dark">
            <Truck size={20} className="text-brand-terracotta" />
            <h2 className="text-sm font-bold tracking-editorial uppercase">1. Tarifas y Plazos de Envío</h2>
          </div>
          <p>
            • <strong className="text-warm-dark">España Peninsular y Portugal:</strong> Envío Estándar 24h/48h laboral. Gratuito para pedidos superiores a 90,00 €. Para pedidos inferiores a 90,00 €, los gastos de envío son de 4,90 €.<br />
            • <strong className="text-warm-dark">Islas Baleares y Canarias:</strong> Entrega en 3-5 días laborables. Gastos de envío calculados en checkout.
          </p>
        </div>

        <div className="bg-warm-card border border-warm-border p-6 rounded-xs space-y-3 shadow-xs">
          <div className="flex items-center gap-3 text-warm-dark">
            <RotateCcw size={20} className="text-brand-terracotta" />
            <h2 className="text-sm font-bold tracking-editorial uppercase">2. Devoluciones y Cambios de Talla</h2>
          </div>
          <p>
            Dispones de <strong className="text-warm-dark">30 días naturales</strong> desde la recepción de tu pedido para solicitar un cambio de talla o devolución. Las prendas deben mantener sus etiquetas originales intactas y no presentar signos de uso.
          </p>
        </div>

        <div className="bg-warm-card border border-warm-border p-6 rounded-xs space-y-3 shadow-xs">
          <div className="flex items-center gap-3 text-warm-dark">
            <ShieldCheck size={20} className="text-brand-terracotta" />
            <h2 className="text-sm font-bold tracking-editorial uppercase">3. Sincronización en Tiempo Real</h2>
          </div>
          <p>
            Todos los pedidos realizados en ModaEnma entran directamente en la cola de procesamiento de la boutique <strong className="text-warm-dark">ModaInma Management</strong>, garantizando que el stock se descuente de forma inmediata y que recibas el número de seguimiento por SMS / email.
          </p>
        </div>
      </div>
    </div>
  );
}
