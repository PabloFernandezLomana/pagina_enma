# LANZAMIENTO — ModaEnma (tienda) + Panel de gestión

Documento honesto: qué está hecho, qué está **comprobado** y qué falta por tu parte.

## 1. Qué hay

| Pieza | Carpeta | Tecnología | Dónde se publica |
|---|---|---|---|
| Tienda pública | `moda-enma-tienda/` | Next.js 14 | Firebase App Hosting (plan Blaze) |
| Panel privado | `pagina_inma/` | React 19 + Vite (PWA) | Firebase Hosting |
| Datos | Firestore + Storage + Auth | mismo proyecto Firebase | — |

**Fuente única de configuración:** `site.config.js` y `tokens.css` (raíz). Tras editarlos ejecuta `node scripts/sync-shared.mjs` para copiarlos a la tienda y al panel.

## 2. Reglas de negocio implementadas
- Pago: **solo PayPal o pago en mano**.
- Envío a domicilio: 3,90 € (siempre), **solo con PayPal**. Sin envío gratis.
- Quedar en persona (Málaga): sin coste, pago en mano o PayPal. No hay tienda física ni recogida.
- Precios con IVA incluido; las facturas **no desglosan IVA** (`invoices.showVatBreakdown: false` en `site.config.js`).
- El precio de compra (coste) vive en `products_private`: **nunca** es público.

## 3. Estado verificado (en mi entorno, sin Firebase real)
- ✅ Tienda compila (`next build`) y se ve bien en escritorio y móvil con el catálogo de prueba.
- ✅ Panel compila (`vite build`) y probado de punta a punta en modo demo: subir producto con foto, editar tallas/stock, cambiar estado de pedido, venta manual con descuento de stock, factura PDF.
- ✅ API de pedidos: valida datos, rechaza envío sin dirección, rechaza PayPal si no está configurado, `/api/products` (insegura) eliminada, 404 reales.
- ⚠️ **NO probado contra Firestore real ni PayPal real**: no tengo acceso a tu proyecto ni pude arrancar el emulador (red bloqueada). La lógica de transacciones, las reglas y el flujo PayPal están escritos siguiendo la documentación, pero **tienes que hacer las pruebas del apartado 6 en PayPal Sandbox antes de cobrar nada real**.

## 4. Puesta en marcha (una sola vez)

1. **Firebase**: crea un proyecto en console.firebase.google.com. Activa Firestore (modo producción), Storage y Authentication (correo/contraseña). Pasa a plan **Blaze** (necesario para App Hosting; con tu tráfico el coste suele ser ~0 €).
2. **Cuenta del panel**: Authentication → Usuarios → Añadir usuario (tu correo y contraseña).
3. **`.firebaserc`**: sustituye `REEMPLAZA-CON-TU-PROJECT-ID` por el ID de tu proyecto.
4. **Reglas**: `npm i -g firebase-tools`, `firebase login`, y desde la raíz: `firebase deploy --only firestore:rules,storage`.
5. **Administrador**: descarga una clave de cuenta de servicio (Configuración → Cuentas de servicio), guárdala fuera del repo y en `moda-enma-tienda/.env.local` pon `FIREBASE_SERVICE_ACCOUNT_KEY=` con su contenido (en una línea o en base64). Luego, en `moda-enma-tienda/`: `npm run set-admin -- tucorreo@ejemplo.com`. Cierra sesión y entra de nuevo en el panel.
6. **Productos de prueba**: `npm run seed-demo` (en `moda-enma-tienda/`). Se borran desde el panel (Ajustes → Borrar productos de prueba) o con `npm run purge-demo`.
7. **Panel**: copia `pagina_inma/.env.example` a `.env`, rellena las 6 claves de Firebase (app web) y ejecuta `npm run build` y, desde la raíz, `firebase deploy --only hosting`.
8. **Tienda**: rellena `moda-enma-tienda/apphosting.yaml` (claves Firebase públicas y dominio) y crea los secretos de PayPal (`firebase apphosting:secrets:set PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`). Conecta el repo de GitHub en Firebase → App Hosting y elige la carpeta `moda-enma-tienda`.
9. **Dominio**: cuando lo tengas, ponlo en `site.config.js` (`brand.domain`), ejecuta `node scripts/sync-shared.mjs` y añádelo en App Hosting.

## 5. PayPal (cuando crees la cuenta Business)
1. developer.paypal.com → Apps & Credentials → crea una app (primero **Sandbox**) → copia Client ID y Secret.
2. Pon `PAYPAL_ENV=sandbox` y las credenciales (secretos de App Hosting o `.env.local`).
3. Webhooks → añade `https://TU-DOMINIO/api/paypal/webhook` con los eventos `PAYMENT.CAPTURE.COMPLETED`, `DENIED`, `REFUNDED` y `REVERSED`. Copia el *Webhook ID* a `PAYPAL_WEBHOOK_ID`.
4. Cuando todo funcione en sandbox: `PAYPAL_ENV=live` con las credenciales **live**.

Cómo funciona: al confirmar, el servidor crea el pedido y **reserva el stock** en una transacción; PayPal cobra; el servidor captura el pago y solo entonces lo marca pagado (comprueba importe exacto y moneda). Si el cliente abandona, se libera el stock; si se cierra el navegador a medias, puedes cancelarlo desde el panel.

## 6. Pruebas que debes hacer antes de abrir al público
- [ ] Compra de prueba con PayPal **Sandbox**: aparece en el panel como "PayPal · pagado" y el stock baja.
- [ ] Abandonar el pago de PayPal: el pedido no queda como pagado y el stock se libera.
- [ ] Compra "quedar en persona + pago en mano": entra en el panel como "Cobrar en mano".
- [ ] Dos personas compran la última unidad a la vez: solo una lo consigue.
- [ ] Cancelar un pedido en el panel devuelve el stock a la tienda.
- [ ] Subir un producto con 3 fotos desde el móvil: se ve en la tienda sin recargar el panel.
- [ ] Crear una factura y abrir el PDF.
- [ ] Desde un navegador sin sesión, `firestore` no deja leer `orders`, `clients` ni `products_private`.

## 7. Pendiente de tus datos (la web no inventa nada)
Todo se rellena en `site.config.js`; lo vacío simplemente no se muestra:
- Nombre/razón social, NIF, dirección, correo y teléfono/WhatsApp.
- Instagram, TikTok, Facebook (los botones del pie aparecen solos al poner la URL).
- Dominio.
- Fotos y productos reales.

## 8. Importante (legal, no técnico)
- Los textos legales (términos, privacidad, cookies, aviso legal, envíos y devoluciones) son una **base razonable, no asesoramiento jurídico**. Que los revise tu gestor/a o un abogado/a.
- Vender de forma habitual a través de una web requiere identificarte como titular (nombre, NIF, domicilio) y, normalmente, el alta como autónomo/a. Hasta rellenar esos datos, las páginas legales mostrarán campos pendientes: **no abras ventas reales sin completarlos**.
- Las facturas sin desglose de IVA deben validarse con tu gestor/a.
- Los precios de tienda incluyen IVA; el derecho de desistimiento es de 14 días.
