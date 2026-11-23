'use client';
// moda-enma-tienda/src/app/error.js — fallo inesperado en una página (500 amable).
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center" role="alert">
      <p className="eyebrow">Algo ha fallado</p>
      <h1 className="h-display mt-3 text-[clamp(40px,7vw,88px)]">No hemos podido cargar esto</h1>
      <p className="mt-4 max-w-[44ch] text-[17px] text-ink-soft">Ha sido un fallo nuestro, no tuyo. Inténtalo otra vez; si sigue igual, escríbenos por WhatsApp.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn btn-primary">Reintentar</button>
        <a href="/" className="btn">Ir al inicio</a>
      </div>
    </section>
  );
}
