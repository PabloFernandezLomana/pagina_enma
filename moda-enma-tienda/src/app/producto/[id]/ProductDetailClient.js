'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailClient({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const { name, category = 'Moda', sku = 'REF-001', salePrice = 0, description = '', image, images, variants, is3d } = product;

  const fallbackImg = "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85";
  const rawImageList = images && images.length > 0 ? images : [image || fallbackImg];
  const imageList = rawImageList.filter(Boolean);
  
  const [activeImg, setActiveImg] = useState(imageList[0] || fallbackImg);
  const [isImgLoading, setIsImgLoading] = useState(true);
  
  // Available sizes
  const availableVariants = variants && variants.length > 0 ? variants : [
    { size: 'XS', stock: 2 },
    { size: 'S', stock: 4 },
    { size: 'M', stock: 5 },
    { size: 'L', stock: 3 },
    { size: 'XL', stock: 1 }
  ];

  const firstAvailableSize = availableVariants.find(v => v.stock > 0)?.size || availableVariants[0]?.size || 'S';
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize);
  const [activeTab, setActiveTab] = useState('detalle');

  const currentVariant = availableVariants.find(v => v.size === selectedSize);
  const selectedStock = currentVariant ? currentVariant.stock : 0;
  const isSelectedOutOfStock = selectedStock === 0;

  const handleAddToCart = () => {
    if (isSelectedOutOfStock) return;
    addToCart(product, selectedSize, 1);
  };

  const handleThumbnailClick = (img) => {
    if (img !== activeImg) {
      setIsImgLoading(true);
      setActiveImg(img);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-editorial uppercase text-warm-muted mb-8">
        <Link href="/" className="hover:text-warm-dark transition-colors">Inicio</Link>
        <span>/</span>
        <Link href={`/${category.toLowerCase()}`} className="hover:text-warm-dark transition-colors">{category}</Link>
        <span>/</span>
        <span className="text-warm-dark font-bold line-clamp-1">{name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Multi-Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-4">
            
            {/* Main Image Frame with Skeleton Loading Placeholder */}
            <div className="aspect-[3/4] w-full bg-warm-sand rounded-xs overflow-hidden relative border border-warm-border shadow-xs">
                {isImgLoading && (
                  <div className="absolute inset-0 bg-warm-sand animate-pulse flex items-center justify-center text-warm-muted text-xs font-medium">
                    <span>Cargando fotografía de alta resolución...</span>
                  </div>
                )}
                <Image
                  src={activeImg}
                  alt={name || "Prenda ModaEnma"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={`object-cover object-center transition-opacity duration-300 ${
                    isImgLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoadingComplete={() => setIsImgLoading(false)}
                />
              </div>

              {/* Thumbnails Carousel Row (Zara / Mango Style Multi-Image Gallery) */}
              {imageList.length > 1 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-editorial uppercase text-warm-muted block">
                    Vistas de la Prenda ({imageList.length} fotografías):
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imageList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleThumbnailClick(img)}
                        className={`w-20 h-24 relative rounded-xs overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeImg === img ? 'border-brand-terracotta scale-102 shadow-xs' : 'border-transparent opacity-65 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Vista ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
        </div>

        {/* Right Column: Details & Purchase Actions */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          <div>
            <span className="text-[10px] font-bold tracking-editorial uppercase text-warm-muted block mb-2">
              REF: {sku} • {category}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-warm-dark tracking-tight uppercase leading-tight">
              {name}
            </h1>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-warm-dark tracking-wide">
                {salePrice.toFixed(2)} €
              </span>
              <span className="text-xs text-warm-muted font-medium">
                IVA incluido
              </span>
            </div>
          </div>

          <p className="text-xs text-warm-muted font-light leading-relaxed border-t border-b border-warm-border py-4">
            {description}
          </p>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold tracking-editorial uppercase text-warm-dark">
                Selecciona Talla:
              </span>
              {selectedStock > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check size={13} />
                  Stock disponible ({selectedStock} ud.)
                </span>
              ) : (
                <span className="text-red-600 font-bold">Agotado en esta talla</span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {availableVariants.map((v) => {
                const isSelected = selectedSize === v.size;
                const isOut = v.stock === 0;

                return (
                  <button
                    key={v.size}
                    disabled={isOut}
                    onClick={() => setSelectedSize(v.size)}
                    className={`py-3 text-xs font-bold rounded-xs transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-brand-terracotta text-white border-2 border-brand-terracotta shadow-xs'
                        : isOut
                        ? 'bg-warm-sand text-warm-muted border border-warm-border opacity-40 cursor-not-allowed line-through'
                        : 'bg-white text-warm-dark border border-warm-border hover:border-brand-terracotta'
                    }`}
                  >
                    <span>{v.size}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isOut ? 'Agotado' : `${v.stock} ud`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isSelectedOutOfStock}
              className={`w-full py-4 font-bold text-xs tracking-editorial uppercase flex items-center justify-center gap-3 rounded-xs shadow-md transition-all ${
                isSelectedOutOfStock
                  ? 'bg-warm-sand text-warm-muted cursor-not-allowed'
                  : 'bg-brand-terracotta text-white hover:bg-brand-terracottaDark transform hover:-translate-y-0.5'
              }`}
            >
              <ShoppingBag size={18} />
              <span>{isSelectedOutOfStock ? 'Talla Agotada' : 'Añadir a la Bolsa'}</span>
            </button>
          </div>

          {/* Guarantees Reales */}
          <div className="bg-warm-card p-4 border border-warm-border rounded-xs space-y-3 text-xs text-warm-muted shadow-xs">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-brand-terracotta" />
              <span>Entrega local y recogida disponible en Málaga</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={16} className="text-brand-terracotta" />
              <span>Derecho de desistimiento y devolución en 14 días naturales</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-brand-terracotta" />
              <span>Precios con IVA incluido • Pago seguro en mano o con PayPal</span>
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Buy Bar en Móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-warm-border p-3.5 z-40 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="font-display text-lg font-bold text-warm-dark block leading-tight">{salePrice.toFixed(2)} €</span>
          <span className="text-[10px] text-warm-muted uppercase">Talla seleccionada: <strong>{selectedSize}</strong></span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isSelectedOutOfStock}
          className={`py-3 px-6 font-bold text-xs tracking-editorial uppercase flex items-center gap-2 rounded-xs shadow-md transition-all ${
            isSelectedOutOfStock
              ? 'bg-warm-sand text-warm-muted cursor-not-allowed'
              : 'bg-brand-terracotta text-white active:scale-98'
          }`}
        >
          <ShoppingBag size={15} />
          <span>{isSelectedOutOfStock ? 'Agotada' : 'Añadir'}</span>
        </button>
      </div>
    </div>
  );
}
