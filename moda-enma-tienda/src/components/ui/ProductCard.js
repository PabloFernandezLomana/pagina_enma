'use client';

import Link from 'next/link';
import Image from 'next/image';
import SpotlightCard from '../animations/SpotlightCard';

export default function ProductCard({ product }) {
  const { id, name, category, salePrice, image, images, tag, variants } = product;

  const mainImg = image || (images && images[0]) || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80";
  const hoverImg = (images && images.length > 1) ? images[1] : mainImg;

  const totalStock = variants ? variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 10;
  const isOutOfStock = totalStock === 0;

  const isHighlightedTag = tag && (tag.includes('3D') || tag.includes('Novedad') || tag.includes('Limitada'));

  return (
    <Link href={`/producto/${id}`} className="group block h-full">
      <SpotlightCard className="h-full flex flex-col justify-between">
        
        {/* Product Image Wrapper */}
        <div className="product-img-wrapper aspect-[3/4] w-full bg-warm-sand overflow-hidden relative">
          <Image
            src={mainImg}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="main-img object-cover object-center w-full h-full transition-transform duration-700 ease-out"
          />
          {hoverImg !== mainImg && (
            <Image
              src={hoverImg}
              alt={`${name} alt view`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="hover-img object-cover object-center w-full h-full absolute inset-0 opacity-0 transition-all duration-700 ease-out"
            />
          )}

          {/* Badges in warm clear palette */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
            {tag && (
              <span className={`text-[10px] font-bold tracking-editorial uppercase px-2.5 py-1 rounded-xs ${
                isHighlightedTag
                  ? 'bg-brand-terracotta text-white border border-brand-terracottaDark shadow-xs'
                  : 'bg-white/95 text-warm-dark font-bold border border-warm-border shadow-xs backdrop-blur-xs'
              }`}>
                {tag}
              </span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] font-bold tracking-editorial uppercase px-2.5 py-1 bg-red-700 text-white rounded-xs shadow-xs">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col justify-between flex-grow bg-white">
          <div>
            <span className="text-[10px] font-bold tracking-editorial uppercase text-warm-muted block mb-1">
              {category}
            </span>
            <h3 className="text-sm font-medium text-warm-dark group-hover:text-brand-terracotta transition-colors line-clamp-1">
              {name}
            </h3>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-warm-border">
            <span className="text-sm font-bold text-warm-dark tracking-wide">
              {salePrice.toFixed(2)} €
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-editorial text-brand-terracotta group-hover:underline transition-all">
              Ver detalle →
            </span>
          </div>
        </div>

      </SpotlightCard>
    </Link>
  );
}
