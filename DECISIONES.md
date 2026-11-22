# DECISIONES

1. **Un solo origen de datos: Firestore.** El panel ya no usa localStorage ni llamadas a `localhost`. Tienda y panel leen en tiempo real.
2. **El coste de compra es privado** (`products_private`, solo admin). Las reglas de Firestore no pueden ocultar campos, por eso va aparte.
3. **Todo lo sensible se escribe en servidor** (pedidos, PayPal, estadísticas) con transacciones. El navegador del cliente no puede escribir en `orders` ni `clients`.
4. **PayPal real** (crear → capturar en servidor → webhook firmado). Sin pedidos falsos ni "pagado" automático.
5. **Sin catálogo falso en producción.** Los productos de prueba son documentos normales marcados `demo: true` que se borran con un clic.
6. **3D:** se retiró el visor pesado (three.js). En su lugar, un carrusel 3D y tarjetas con inclinación hechos con CSS (sin librerías, rápido en móvil). Si luego quieres algo en 3D real, se añade como módulo aparte.
7. **Envío:** 3,90 € fijo, solo PayPal; en persona (Málaga) gratis con pago en mano o PayPal. No hay tienda física.
8. **Facturas sin desglose de IVA** (ajuste `invoices.showVatBreakdown`).
9. **Config única:** `site.config.js` y `tokens.css` en la raíz, sincronizados con `scripts/sync-shared.mjs`.
10. **Pagos pendientes de PayPal:** reservan stock; si el cliente abandona se libera. No hay tarea programada: lo puedes liberar a mano cancelando el pedido en el panel.
11. **Despliegue sin tarjeta (21-22 nov 2026):** Firebase App Hosting y Cloud Storage exigen plan Blaze (tarjeta). La tienda pasa a **Cloudflare Workers** (Next 15 + OpenNext), las fotos a **Cloudinary** (subida directa desde el panel con un preset *unsigned*), y el panel sigue en Firebase Hosting (Spark). La tienda accede a Firestore por **API REST** (sin `firebase-admin`).
12. **Catálogo en caché en memoria** (30 s por instancia) en vez de `unstable_cache`, para no gastar lecturas gratuitas de Firestore.
13. **Imágenes sin optimizador de Next** (`unoptimized`): llegan ya comprimidas a webp desde el panel.
