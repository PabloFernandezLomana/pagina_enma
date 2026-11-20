'use client';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SITE_CONFIG } from '@/site.config';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  const freeShippingMin = SITE_CONFIG.shipping.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingMin - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / freeShippingMin) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-warm-border shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-warm-border flex items-center justify-between bg-[#fcfbf9]">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-warm-dark" />
              <h2 className="text-sm font-bold tracking-editorial uppercase text-warm-dark">
                Bolsa de Compra
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-warm-muted hover:text-warm-dark p-1 transition-colors"
              aria-label="Cerrar bolsa"
            >
              <X size={20} />
            </button>
          </div>

          {/* Shipping Info Banner */}
          <div className="bg-warm-sand/70 px-6 py-3.5 border-b border-warm-border text-xs text-warm-muted flex items-center justify-between">
            <span>Reparto y entrega en Málaga</span>
            <span className="font-bold text-warm-dark">{SITE_CONFIG.shipping.localDeliveryCost.toFixed(2)} €</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag size={48} className="mx-auto text-warm-border" />
                <p className="text-sm text-warm-muted">Tu bolsa de compra está vacía.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-brand-terracotta text-white text-xs font-bold tracking-editorial uppercase rounded-xs hover:bg-brand-terracottaDark transition-colors shadow-sm"
                >
                  Descubrir Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 pb-6 border-b border-warm-border">
                  <div className="w-20 h-24 bg-warm-sand rounded-xs overflow-hidden relative flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-semibold text-warm-dark line-clamp-1 pr-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-warm-muted hover:text-red-600 transition-colors p-0.5"
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-warm-muted mt-0.5">
                        Talla: <span className="text-warm-dark font-bold">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-warm-border rounded-xs bg-warm-sand/50">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-warm-muted hover:text-warm-dark"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-warm-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-warm-muted hover:text-warm-dark"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-warm-dark">
                        {(item.salePrice * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-warm-border bg-[#fcfbf9] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-warm-muted">
                  <span>Subtotal</span>
                  <span className="text-warm-dark font-semibold">{cartTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-warm-muted">
                  <span>Gastos de Envío</span>
                  <span className="text-warm-dark font-medium">
                    {remainingForFreeShipping === 0 ? 'GRATIS' : '4.90 €'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-warm-dark pt-2 border-t border-warm-border">
                  <span>TOTAL ESTIMADO</span>
                  <span>
                    {(cartTotal + (remainingForFreeShipping === 0 ? 0 : 4.90)).toFixed(2)} €
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-brand-terracotta text-white font-bold text-xs tracking-editorial uppercase flex items-center justify-center gap-2 hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-md"
              >
                <span>Tramitar Pedido</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
