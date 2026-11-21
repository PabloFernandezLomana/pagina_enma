'use client';
// moda-enma-tienda/src/components/layout/CookieNotice.js
// Aviso informativo: solo se usa almacenamiento técnico (bolsa) y PayPal al pagar. No hay analítica ni publicidad.
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem('modaenma_notice_v1')); } catch {}
  }, []);
  if (!show) return null;
  const close = () => { try { localStorage.setItem('modaenma_notice_v1', '1'); } catch {} setShow(false); };
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-xl animate-[rise_0.5s_var(--ease-out)] items-center gap-4 rounded-lg bg-ink px-5 py-4 text-[13px] leading-snug text-cream shadow-lift max-sm:bottom-[76px]">
      <p>Solo usamos almacenamiento técnico para tu bolsa y, al pagar, PayPal. Sin publicidad ni seguimiento. <Link href="/cookies" className="underline underline-offset-2">Más información</Link></p>
      <button onClick={close} className="btn shrink-0 !min-h-[40px] bg-cream !px-5 text-ink">Entendido</button>
    </div>
  );
}
