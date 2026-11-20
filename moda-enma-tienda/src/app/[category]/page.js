import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilterBar from '@/components/ui/CategoryFilterBar';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { getProducts, getCategoryInfo } from '@/lib/productService';

export default async function CategoryPage({ params, searchParams }) {
  const categoryId = params.category;
  const categoryInfo = getCategoryInfo(categoryId) || {
    name: categoryId.toUpperCase(),
    desc: 'Catálogo exclusivo de moda y complementos.'
  };

  const selectedSize = searchParams?.size || 'todos';
  const sort = searchParams?.sort || 'default';

  let products = await getProducts({ category: categoryId });

  // Size Filter
  if (selectedSize && selectedSize !== 'todos') {
    products = products.filter(p => 
      p.variants && p.variants.some(v => v.size.toLowerCase() === selectedSize.toLowerCase() && v.stock > 0)
    );
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => a.salePrice - b.salePrice);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.salePrice - a.salePrice);
  }

  return (
    <div className="min-h-screen bg-warm-bg text-warm-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Category Header */}
      <div className="border-b border-warm-border pb-8 mb-10 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-editorial uppercase text-warm-muted">
          <Link href="/" className="hover:text-warm-dark transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-warm-dark font-bold">{categoryInfo.name}</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-light uppercase tracking-tight text-warm-dark">
          {categoryInfo.name}
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted font-light max-w-2xl leading-relaxed">
          {categoryInfo.desc}
        </p>
      </div>

      {/* Filter Bar Client Component */}
      <CategoryFilterBar currentCategory={categoryId} />

      {/* Products Grid (Zara/Mango: 2 columnas en móvil, 4 en desktop) */}
      {products.length === 0 ? (
        <div className="text-center py-24 bg-warm-card border border-warm-border rounded-sm space-y-4">
          <p className="text-base text-warm-muted">
            No se encontraron prendas para los filtros seleccionados en {categoryInfo.name}.
          </p>
          <Link
            href={`/${categoryId}`}
            className="inline-block px-6 py-2.5 bg-brand-terracotta text-white text-xs font-bold tracking-editorial uppercase rounded-xs hover:bg-brand-terracottaDark transition-colors shadow-sm"
          >
            Restablecer Filtros
          </Link>
        </div>
      ) : (
        <ScrollReveal stagger={0.06} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ScrollReveal>
      )}

    </div>
  );
}
