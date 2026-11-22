'use client';
// moda-enma-tienda/src/components/ui/LiveGrid.js
// Rejilla con filtros instantáneos y stock EN TIEMPO REAL (si Firebase del navegador está configurado).
import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { getClientFirestore } from '@/lib/firebase.client';
import { toPublicProduct, isSoldOut } from '@/lib/productShape';

export function useLiveProducts(initial, filter) {
  const [list, setList] = useState(initial);
  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    getClientFirestore().then((c) => {
      if (!c || cancelled) return;
      const { db, fs } = c;
      unsub = fs.onSnapshot(
        fs.query(fs.collection(db, 'products'), fs.where('active', '==', true)),
        (snap) => {
          const all = snap.docs.map((d) => toPublicProduct(d.id, d.data()));
          setList(filter ? all.filter(filter) : all);
        },
        () => {}
      );
    });
    return () => { cancelled = true; unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return list;
}

const SORTS = {
  reco: { label: 'Recomendados', fn: (a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)) },
  new: { label: 'Novedades', fn: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) },
  asc: { label: 'Precio: de menor a mayor', fn: (a, b) => a.salePrice - b.salePrice },
  desc: { label: 'Precio: de mayor a menor', fn: (a, b) => b.salePrice - a.salePrice },
};

export default function LiveGrid({ initial, department, filters = true, emptyText = 'Todavía no hay nada por aquí.' }) {
  const list = useLiveProducts(initial, department ? (p) => p.department === department : null);
  const [sort, setSort] = useState('reco');
  const [size, setSize] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const sizes = useMemo(() => [...new Set(list.flatMap((p) => p.variants.map((v) => v.size)))], [list]);
  const shown = useMemo(() => {
    let l = list;
    if (size) l = l.filter((p) => p.variants.some((v) => v.size === size && v.stock > 0));
    if (onlyAvailable) l = l.filter((p) => !isSoldOut(p));
    return [...l].sort(SORTS[sort].fn);
  }, [list, sort, size, onlyAvailable]);

  return (
    <div>
      {filters && list.length > 1 && (
        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
          {sizes.length > 1 && (
            <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="group" aria-label="Filtrar por talla">
              <span className="shrink-0 text-[13px] font-semibold">Talla</span>
              {['', ...sizes].map((s) => (
                <button key={s || 'todas'} onClick={() => setSize(s)} aria-pressed={size === s}
                  className={`min-h-[40px] shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-[background-color,color,border-color,transform] duration-150 active:scale-95 ${size === s ? 'border-ink bg-ink text-cream' : 'border-line bg-paper hover:border-ink'}`}>
                  {s || 'Todas'}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-[13px] font-medium">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-[18px] w-[18px] accent-[rgb(var(--c-terracotta-deep))]" />
              Solo disponibles
            </label>
            <label className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="sr-only sm:not-sr-only">Ordenar</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-full border border-line bg-paper px-4 text-[13px] font-medium focus:border-terracotta-deep focus:outline-none">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}
      {shown.length === 0 ? (
        <p className="rounded-lg bg-sand/60 px-6 py-16 text-center text-[16px] text-ink-soft">{size || onlyAvailable ? 'Nada con esos filtros. Prueba otra talla.' : emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
          {shown.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}
    </div>
  );
}
