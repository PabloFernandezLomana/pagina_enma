'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockCatalog';

export default function CategoryFilterBar({ currentCategory }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'default';
  const currentSize = searchParams.get('size') || 'todos';

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    router.push(`/${currentCategory}?sort=${sortVal}&size=${currentSize}`);
  };

  return (
    <div className="bg-warm-card border border-warm-border p-4 rounded-sm mb-10 flex flex-wrap items-center justify-between gap-4 shadow-xs">
      {/* Category Pills Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Link
          href="/"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-full tracking-wider transition-all whitespace-nowrap bg-warm-pill text-warm-dark hover:bg-warm-border hover:text-black"
        >
          ← Inicio
        </Link>
        <span className="text-[10px] font-bold tracking-editorial uppercase text-warm-muted mx-1">
          |
        </span>
        {CATEGORIES.map((c) => {
          const isActive = c.id === currentCategory.toLowerCase();
          return (
            <Link
              key={c.id}
              href={`/${c.id}`}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-terracotta text-white font-bold shadow-xs'
                  : 'bg-warm-pill text-warm-dark hover:bg-warm-border hover:text-black'
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Sorting Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-editorial uppercase text-warm-muted">
          Ordenar por:
        </span>
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="bg-white border border-warm-border text-xs text-warm-dark px-3 py-1.5 rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors cursor-pointer shadow-xs font-medium"
        >
          <option value="default">Recomendados</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
        </select>
      </div>
    </div>
  );
}
