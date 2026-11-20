'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const shippingCost = cartTotal >= 90 || cartTotal === 0 ? 0 : 4.90;
  const grandTotal = cartTotal + shippingCost;

  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-light uppercase tracking-tight mb-8">
        Bolsa de Compra ({cart.reduce((s, i) => s + i.quantity, 0)})
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-24 bg-warm-card border border-warm-border rounded-xs space-y-4 shadow-xs">
          <ShoppingBag size={48} className="mx-auto text-warm-border" />
          <p className="text-sm text-warm-muted">Tu carrito está actualmente vacío.</p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-brand-terracotta text-white text-xs font-bold tracking-editorial uppercase rounded-xs hover:bg-brand-terracottaDark transition-colors shadow-sm"
          >
            Explorar Colección
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-warm-card border border-warm-border p-4 rounded-xs flex gap-6 items-center shadow-xs">
                <div className="w-20 h-28 bg-warm-sand rounded-xs overflow-hidden relative flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-warm-dark">{item.name}</h3>
                      <p className="text-xs text-warm-muted mt-1">
                        Categoría: {item.category} • Talla: <strong className="text-warm-dark">{item.size}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-warm-muted hover:text-red-600 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-warm-border rounded-xs bg-warm-sand/50">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1.5 text-warm-muted hover:text-warm-dark"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3 text-xs font-bold text-warm-dark">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1.5 text-warm-muted hover:text-warm-dark"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="text-base font-bold text-warm-dark">
                      {(item.salePrice * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 bg-warm-card border border-warm-border p-6 rounded-xs space-y-6 h-fit sticky top-28 shadow-xs">
            <h2 className="text-xs font-bold tracking-editorial uppercase text-warm-dark border-b border-warm-border pb-3">
              Resumen de la Compra
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-warm-muted">
                <span>Subtotal de artículos</span>
                <span className="text-warm-dark font-semibold">{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-warm-muted">
                <span>Gastos de Envío</span>
                <span className="text-warm-dark font-medium">
                  {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)} €`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-warm-dark pt-4 border-t border-warm-border">
                <span>TOTAL CON IVA</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-brand-terracotta text-white font-bold text-xs tracking-editorial uppercase flex items-center justify-center gap-2 hover:bg-brand-terracottaDark transition-colors rounded-xs shadow-md"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
