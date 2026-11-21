'use client';
// moda-enma-tienda/src/components/ui/TrackView.js
// Cuenta una visita de producto por sesión (para las estadísticas del panel). Anónimo.
import { useEffect } from 'react';

export default function TrackView({ productId }) {
  useEffect(() => {
    try {
      const k = `seen_${productId}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    } catch {}
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'view', productId }), keepalive: true }).catch(() => {});
  }, [productId]);
  return null;
}
