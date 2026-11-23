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
14. **Correo al cliente con Brevo (Resend soportado)** por `fetch` REST: confirmación y cambios de estado. Idempotente (un solo correo aunque PayPal avise dos veces) y a prueba de fallos (un error de correo nunca rompe una compra).
15. **Quedar en persona = Málaga + WhatsApp, sin horarios fijos.** Día, hora y lugar se acuerdan por WhatsApp. No hay chatbot ni selector de franjas.
16. **El panel pide los correos a la tienda** (`/api/admin/order-status-email`) con su sesión de administradora, porque el panel es una web estática sin servidor. La tienda comprueba el permiso de administrador con Google y limita el acceso por origen (CORS).
17. **Aviso de pedidos al móvil del dueño: aplazado.** La API oficial de WhatsApp cobra los mensajes que inicia la tienda; alternativa gratuita y fiable: Telegram.

18. **Auditoría (nov. 2026)** — cambios aplicados:
    - Los pagos PayPal sin completar caducan a los 30 min y devuelven el stock solo (se barre al entrar en la tienda o en el panel; sin tareas programadas). Máx. 2 pagos pendientes por correo.
    - Límite de peticiones por `cf-connecting-ip` (no falsificable) y por correo.
    - Si Firestore falla, la tienda sirve la última copia buena o avisa; nunca enseña "sin artículos" ni un 404 falso.
    - `siteUrl()` quita barras finales y nunca usa localhost en producción.
    - Correos: fallo visible en el panel ("Correo aviso no enviado" + Reintentar) y aviso en Inicio si no hay correo configurado. El envío va en segundo plano (`waitUntil`).
    - Texto unificado: "efectivo" en toda la web, correos y panel.
    - Favicon "E" serif (tienda terracota, panel rosa), manifest, apple-touch-icon, imagen OpenGraph por defecto, canonical por página, `error.js`/`loading.js`.
