'use client';
// moda-enma-tienda/src/app/global-error.js — último recurso si falla el propio layout.
export default function GlobalError({ reset }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#FAF6F0', color: '#2A2420', fontFamily: 'Georgia, serif', display: 'grid', minHeight: '100vh', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, margin: 0 }}>ModaEnma</h1>
          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 17 }}>Algo ha fallado. Vuelve a intentarlo en un momento.</p>
          <button type="button" onClick={() => reset()} style={{ background: '#C4552D', color: '#fff', border: 0, borderRadius: 999, padding: '14px 26px', fontSize: 16, fontWeight: 700 }}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}
