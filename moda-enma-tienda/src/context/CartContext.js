'use client';
// moda-enma-tienda/src/context/CartContext.js
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'modaenma_cart_v2';
const MAX_PER_LINE = 10;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  // Reconcilia precio y stock con el servidor una vez por visita (y al abrir la bolsa).
  const reconcile = useCallback(async (list) => {
    if (!list.length) return;
    try {
      const res = await fetch('/api/cart/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: list.map((i) => ({ key: i.key, productId: i.productId, size: i.size })) }),
      });
      const { items: info } = await res.json();
      if (!info?.length) return;
      setItems((prev) => prev.flatMap((it) => {
        const n = info.find((x) => x.key === it.key);
        if (!n) return [it];
        if (!n.available || n.stock <= 0) return [{ ...it, soldOut: true, max: 0 }];
        return [{ ...it, soldOut: false, price: n.price, max: n.stock, quantity: Math.min(it.quantity, n.stock) }];
      }));
    } catch {}
  }, []);

  useEffect(() => {
    if (ready && !checked.current && items.length) { checked.current = true; reconcile(items); }
  }, [ready, items, reconcile]);

  const add = useCallback((product, size, quantity = 1) => {
    const variant = product.variants.find((v) => v.size === size);
    const max = Math.min(MAX_PER_LINE, variant ? variant.stock : 0);
    if (max <= 0) return { ok: false, reason: 'agotado' };
    const key = `${product.id}__${size}`;
    let capped = false;
    setItems((prev) => {
      const i = prev.findIndex((x) => x.key === key);
      if (i > -1) {
        const next = [...prev];
        const q = Math.min(max, next[i].quantity + quantity);
        capped = q === next[i].quantity;
        next[i] = { ...next[i], quantity: q, max, price: product.salePrice, soldOut: false };
        return next;
      }
      return [...prev, { key, productId: product.id, name: product.name, price: product.salePrice, image: product.images[0] || '', department: product.department, size, quantity: Math.min(max, quantity), max }];
    });
    setOpen(true);
    return { ok: true, capped };
  }, []);

  const remove = useCallback((key) => setItems((p) => p.filter((i) => i.key !== key)), []);
  const restore = useCallback((item) => setItems((p) => (p.some((i) => i.key === item.key) ? p : [...p, item])), []);
  const setQty = useCallback((key, q) => setItems((p) => p.flatMap((i) => {
    if (i.key !== key) return [i];
    if (q <= 0) return [];
    return [{ ...i, quantity: Math.min(q, i.max || MAX_PER_LINE) }];
  })), []);
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => { setOpen(true); reconcile(items); }, [items, reconcile]);

  const value = useMemo(() => {
    const buyable = items.filter((i) => !i.soldOut);
    return {
      items, ready, open, setOpen, openCart, add, remove, restore, setQty, clear,
      count: buyable.reduce((s, i) => s + i.quantity, 0),
      subtotal: Math.round(buyable.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
      reconcile,
    };
  }, [items, ready, open, openCart, add, remove, restore, setQty, clear, reconcile]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
