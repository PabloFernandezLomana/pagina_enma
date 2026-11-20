'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, MapPin, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SITE_CONFIG } from '@/site.config';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Málaga',
    postalCode: '29001',
    shippingMethod: 'delivery', // 'delivery' | 'pickup'
    paymentMethod: 'cash', // 'cash' | 'paypal'
    termsAccepted: false,
    honeypot: '',
    notes: ''
  });

  const shippingCost = formData.shippingMethod === 'pickup'
    ? 0
    : (cartTotal >= SITE_CONFIG.shipping.freeShippingThreshold || cartTotal === 0 ? 0 : SITE_CONFIG.shipping.localDeliveryCost);

  const grandTotal = cartTotal + shippingCost;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) return;

    if (!formData.termsAccepted) {
      setErrorMsg('Debes leer y aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.shippingMethod === 'pickup' ? SITE_CONFIG.shipping.pickupAddress : formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
          termsAccepted: formData.termsAccepted,
          honeypot: formData.honeypot,
          notes: formData.notes,
          items: cart.map(item => ({
            productId: item.id,
            size: item.size,
            quantity: item.quantity
          }))
        })
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || 'Error al procesar el pedido');
      }

      setCompletedOrder(res.order);
      clearCart();

    } catch (err) {
      console.error("Error al tramitar pedido:", err);
      setErrorMsg(err.message || "Hubo un error registrando el pedido.");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de Confirmación de Pedido
  if (completedOrder) {
    const isCash = completedOrder.paymentMethod === 'cash';
    const isPickup = completedOrder.shippingMethod.includes('Recogida');

    return (
      <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-[#FDE8EC] text-brand-terracotta rounded-full flex items-center justify-center mx-auto border border-brand-terracotta/30">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-editorial-sub">¡PEDIDO RECIBIDO CON ÉXITO!</span>
          <h1 className="font-display text-4xl sm:text-5xl font-light uppercase tracking-tight text-warm-dark">
            Gracias por tu confianza
          </h1>
          <p className="text-sm text-warm-muted font-light max-w-md mx-auto">
            Hemos registrado tu pedido en nuestra boutique. Prepararemos tus prendas con el máximo esmero.
          </p>
        </div>

        <div className="bg-white border border-warm-border p-6 rounded-md text-left max-w-lg mx-auto space-y-3 text-xs shadow-xs">
          <div className="flex justify-between border-b border-warm-border pb-2">
            <span className="text-warm-muted">Número de Pedido:</span>
            <span className="font-bold text-warm-dark tracking-wide">{completedOrder.id}</span>
          </div>
          <div className="flex justify-between border-b border-warm-border pb-2">
            <span className="text-warm-muted">Cliente:</span>
            <span className="text-warm-dark font-medium">{completedOrder.clientName} ({completedOrder.clientPhone})</span>
          </div>
          <div className="flex justify-between border-b border-warm-border pb-2">
            <span className="text-warm-muted">Método de Entrega:</span>
            <span className="text-warm-dark font-medium">{completedOrder.shippingMethod}</span>
          </div>
          <div className="flex justify-between border-b border-warm-border pb-2">
            <span className="text-warm-muted">Forma de Pago:</span>
            <span className="text-brand-terracotta font-bold">
              {isCash ? 'Pago en mano (al recibir o recoger)' : 'Pagado mediante PayPal'}
            </span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-sm text-warm-dark">
            <span>Total:</span>
            <span>{completedOrder.total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={`https://wa.me/34600000000?text=Hola,%20acabo%20de%20hacer%20el%20pedido%20${completedOrder.id}%20en%20ModaEnma.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] text-white font-bold text-xs tracking-editorial uppercase hover:opacity-90 transition-opacity rounded-xs shadow-md inline-flex items-center justify-center gap-2"
          >
            <span>Consultar Estado por WhatsApp</span>
          </a>
          <Link
            href="/"
            className="px-6 py-3.5 bg-white border border-warm-border text-warm-dark font-bold text-xs tracking-editorial uppercase hover:bg-warm-sand transition-colors rounded-xs shadow-xs inline-flex items-center justify-center"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-warm-bg text-warm-dark pt-32 pb-20 px-4 text-center space-y-4">
        <ShoppingBag size={40} className="mx-auto text-warm-muted" />
        <h2 className="font-display text-2xl uppercase">Tu bolsa está vacía</h2>
        <p className="text-xs text-warm-muted">Añade prendas antes de tramitar tu compra.</p>
        <Link href="/" className="inline-block px-7 py-3 bg-brand-terracotta text-white text-xs font-bold uppercase tracking-editorial rounded-xs shadow-md">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-2xl mb-8">
        <span className="text-editorial-sub">PASARELA OFICIAL MODAENMA</span>
        <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-tight mt-1">
          Finalizar Compra en Boutique
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          
          {/* Bloque 1: Contacto y Entrega */}
          <div className="bg-white border border-warm-border p-6 rounded-xs space-y-4 shadow-xs">
            <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-terracotta text-white rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Contacto y Modalidad de Entrega (Málaga)</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-colors ${formData.shippingMethod === 'delivery' ? 'border-brand-terracotta bg-[#FBECE5]/40' : 'border-warm-border'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="delivery"
                    checked={formData.shippingMethod === 'delivery'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'delivery' })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-warm-dark block">Reparto a Domicilio en Málaga</span>
                    <span className="text-[11px] text-warm-muted">Gratis a partir de {SITE_CONFIG.shipping.freeShippingThreshold} € ({SITE_CONFIG.shipping.localDeliveryCost.toFixed(2)} € en compras menores)</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-colors ${formData.shippingMethod === 'pickup' ? 'border-brand-terracotta bg-[#FBECE5]/40' : 'border-warm-border'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={formData.shippingMethod === 'pickup'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'pickup' })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-warm-dark block">Recogida en Boutique</span>
                    <span className="text-[11px] text-warm-muted">Gratis • {SITE_CONFIG.shipping.pickupSchedule}</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-warm-dark font-semibold">Nombre y Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carmen Navarro"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-warm-dark font-semibold">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="carmen@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-warm-dark font-semibold">Teléfono Móvil (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="612345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                {formData.shippingMethod === 'delivery' && (
                  <>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-warm-dark font-semibold">Dirección de Entrega en Málaga *</label>
                      <input
                        type="text"
                        required
                        placeholder="Calle Larios 12, 3ºB"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-warm-dark font-semibold">Ciudad / Municipio *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-warm-dark font-semibold">Código Postal (Málaga) *</label>
                      <input
                        type="text"
                        required
                        placeholder="29001"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-warm-border rounded-xs p-3 text-warm-dark focus:outline-none focus:border-brand-terracotta"
                      />
                    </div>
                  </>
                )}

                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Método de Pago (Únicamente PayPal y Pago en mano) */}
          <div className="bg-white border border-warm-border p-6 rounded-xs space-y-4 shadow-xs">
            <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-terracotta text-white rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Método de Pago Permitido</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-colors ${formData.paymentMethod === 'cash' ? 'border-brand-terracotta bg-[#FBECE5]/40' : 'border-warm-border'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-warm-dark block">Pago en mano</span>
                  <span className="text-[11px] text-warm-muted">Pagas en efectivo al recibir tu paquete o al recogerlo en la boutique de Málaga.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-colors ${formData.paymentMethod === 'paypal' ? 'border-brand-terracotta bg-[#FBECE5]/40' : 'border-warm-border'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold text-warm-dark block">PayPal Express</span>
                  <span className="text-[11px] text-warm-muted">Pago digital cifrado mediante tu cuenta PayPal.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Bloque 3: Aceptación Legal Obligatoria */}
          <div className="bg-white border border-warm-border p-4 rounded-xs text-xs space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-0.5"
              />
              <span className="text-warm-muted leading-relaxed">
                He leído y acepto los <Link href="/terminos-y-condiciones" target="_blank" className="underline text-warm-dark font-medium">Términos y Condiciones de Venta</Link> y la <Link href="/privacidad" target="_blank" className="underline text-warm-dark font-medium">Política de Privacidad</Link>. Entiendo que los precios incluyen IVA y que cuento con 14 días naturales de derecho de desistimiento.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-terracotta text-white font-bold text-xs tracking-editorial uppercase flex items-center justify-center gap-2 hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-md"
          >
            {loading ? (
              <span>Validando y registrando pedido...</span>
            ) : (
              <span>Finalizar Pedido ({grandTotal.toFixed(2)} €)</span>
            )}
          </button>
        </div>

        {/* Columna Derecha: Resumen de la Bolsa */}
        <div className="lg:col-span-5 bg-white border border-warm-border p-6 rounded-xs space-y-6 h-fit sticky top-28 shadow-xs">
          <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3">
            Resumen de tu Pedido
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex gap-3 items-center text-xs">
                <div className="w-14 h-16 bg-warm-sand relative rounded-xs overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-warm-dark font-semibold block line-clamp-1">{item.name}</span>
                  <span className="text-[11px] text-warm-muted">Talla: {item.size} × {item.quantity} ud</span>
                </div>
                <span className="font-bold text-warm-dark">{(item.salePrice * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-warm-border">
            <div className="flex justify-between text-warm-muted">
              <span>Subtotal</span>
              <span className="text-warm-dark font-medium">{cartTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-warm-muted">
              <span>Envío</span>
              <span className="text-warm-dark font-medium">
                {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)} €`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-warm-dark pt-2 border-t border-warm-border">
              <span>TOTAL (IVA incluido)</span>
              <span>{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
