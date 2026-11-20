import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-editorial-sub">ATENCIÓN AL CLIENTE</span>
        <h1 className="font-display text-4xl sm:text-6xl font-light uppercase tracking-tight text-warm-dark">
          Contacto Boutique
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted font-light max-w-xl mx-auto leading-relaxed">
          Nuestro equipo de asesores de moda está a tu entera disposición para resolver cualquier duda sobre tallas, pedidos o envíos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-warm-card border border-warm-border p-8 rounded-xs space-y-6 shadow-xs">
          <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3">
            Información de la Boutique
          </h2>

          <div className="space-y-4 text-xs text-warm-muted">
            <div className="flex items-start gap-4">
              <MapPin size={18} className="text-brand-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-warm-dark block">ModaInma Boutique Store</strong>
                <span>Calle Sierpes 42, 41004 Sevilla, España</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={18} className="text-brand-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-warm-dark block">Teléfono / WhatsApp Directo</strong>
                <span>+34 612 34 56 78</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={18} className="text-brand-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-warm-dark block">Correo Electrónico</strong>
                <span>atencion@modaenma.es</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={18} className="text-brand-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-warm-dark block">Horario de Taller</strong>
                <span>Lunes a Viernes: 10:00 - 20:30 | Sábados: 10:30 - 14:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-warm-card border border-warm-border p-8 rounded-xs space-y-4 shadow-xs">
          <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3">
            Envíanos un Mensaje
          </h2>

          <form className="space-y-4 text-xs">
            <div>
              <label className="text-warm-dark font-semibold block mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="Tu nombre..."
                className="w-full bg-white border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
              />
            </div>
            <div>
              <label className="text-warm-dark font-semibold block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full bg-white border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
              />
            </div>
            <div>
              <label className="text-warm-dark font-semibold block mb-1">Mensaje o Consulta</label>
              <textarea
                rows={4}
                required
                placeholder="Escribe aquí tu consulta..."
                className="w-full bg-white border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-brand-terracotta text-white font-bold text-xs tracking-editorial uppercase hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-xs"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
