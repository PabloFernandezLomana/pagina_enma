# ModaEnma — Tienda (Next.js 14)

Tienda pública. Lee el catálogo de Firestore (servidor + tiempo real en el navegador) y crea los pedidos **solo desde el servidor** (`/api/orders`).

```bash
npm install
cp .env.example .env.local     # claves de Firebase, PayPal y cuenta de servicio
npm run dev                    # http://localhost:3000
npm run build
```

- Sin credenciales de administrador, en desarrollo se muestra un catálogo de prueba y los pedidos en mano devuelven un éxito "PRUEBA" que no se guarda. En producción nunca hay catálogo falso.
- `npm run seed-demo` / `npm run purge-demo`: productos de ejemplo en Firestore.
- `npm run set-admin -- correo@ejemplo.com`: da acceso al panel.
- `npm run backup`: exporta las colecciones a JSON.
- Config común (marca, envíos, pagos, legal): `../site.config.js` → `node ../scripts/sync-shared.mjs`.

Guía de puesta en marcha: `../LANZAMIENTO.md`.
