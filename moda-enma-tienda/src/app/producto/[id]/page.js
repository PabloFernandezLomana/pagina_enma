import { getProductById } from '@/lib/productService';
import ProductDetailClient from './ProductDetailClient';
import Link from 'next/link';

export default async function ProductPage({ params }) {
  const productId = params?.id;
  const product = await getProductById(productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-warm-bg text-warm-dark flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="font-display text-4xl font-light">Producto no encontrado</h1>
        <p className="text-xs text-warm-muted max-w-md">
          El artículo que buscas no está disponible o ha sido retirado del catálogo.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-brand-terracotta text-white text-xs font-bold tracking-editorial uppercase rounded-xs hover:bg-brand-terracottaDark transition-colors shadow-sm"
        >
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
