import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-editorial-sub">HISTORIA & HERENCIA</span>
        <h1 className="font-display text-4xl sm:text-6xl font-light uppercase tracking-tight text-warm-dark">
          Sobre ModaEnma
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted font-light max-w-xl mx-auto leading-relaxed">
          Nacida como una boutique de moda contemporánea con atención artesanal, ModaEnma ha evolucionado para ofrecer una experiencia digital de lujo sin barreras.
        </p>
      </div>

      <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden border border-warm-border shadow-xs">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85"
          alt="Taller y Atelier ModaEnma"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-warm-muted font-light leading-relaxed border-t border-warm-border pt-12">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-editorial uppercase text-warm-dark">01. Confección Rigurosa</h3>
          <p>Seleccionamos únicamente textiles de la más alta calidad: lino natural 100%, seda de mora, lana virgen y acero inoxidable de grado quirúrgico.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-editorial uppercase text-warm-dark">02. Catálogo Multicategoría</h3>
          <p>Desde vestidos cápsula y sastrería masculina hasta ropa deportiva de alto rendimiento y accesorios metálicos 3D.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-editorial uppercase text-warm-dark">03. Sincronización Total</h3>
          <p>Nuestra tienda online comparte backend directo con la boutique física mediante ModaInma Management para una gestión en tiempo real.</p>
        </div>
      </div>
    </div>
  );
}
