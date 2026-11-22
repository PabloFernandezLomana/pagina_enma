# LANZAMIENTO — ModaEnma (tienda) + Panel de gestión

Documento honesto: qué está hecho, qué está **comprobado** y qué falta por tu parte.

## 1. Qué hay (todo sin tarjeta)

| Pieza | Carpeta | Tecnología | Dónde se publica |
|---|---|---|---|
| Tienda pública | `moda-enma-tienda/` | Next.js 15 | **Cloudflare Workers** (plan gratuito) |
| Panel privado | `pagina_inma/` | React 19 + Vite (PWA) | **Firebase Hosting** (plan Spark) |
| Datos y acceso | Firestore + Authentication | proyecto Firebase `moda-enma` (Spark) | — |
| Fotos | Cloudinary (plan gratuito) | el panel las sube; la tienda las muestra | — |

**Fuente única de configuración:** `site.config.js` y `tokens.css` (raíz). Tras editarlos ejecuta `node scripts/sync-shared.mjs`.

La tienda no usa `firebase-admin` (no funciona en Cloudflare): habla con Firestore por su API REST con la cuenta de servicio (`src/lib/firebaseAdmin.js`). Los scripts de `scripts/` (set-admin, seed-demo, backup) sí lo usan, pero solo se ejecutan en tu ordenador.

## 2. Reglas de negocio implementadas
- Pago: **solo PayPal o pago en mano**.
- Envío a domicilio: 3,90 € (siempre), **solo con PayPal**. Sin envío gratis.
- Quedar en persona (Málaga): sin coste, pago en mano o PayPal. No hay tienda física ni recogida.
- Precios con IVA incluido; las facturas **no desglosan IVA** (`invoices.showVatBreakdown: false` en `site.config.js`).
- El precio de compra (coste) vive en `products_private`: **nunca** es público.

## 3. Estado verificado (en mi entorno)
- ✅ Tienda y panel compilan. La tienda también compila como Worker de Cloudflare (1,3 MB comprimido; el límite gratuito es 3 MB) y responde en un Cloudflare local (`wrangler dev`): páginas, buscador, API de pedidos de prueba.
- ✅ La capa de pedidos se probó contra un Firestore **simulado** (misma API REST): pedido con número secuencial, coste privado, stock, dos compradores a la vez por la última unidad (solo uno la consigue), pedido PayPal y liberación de stock, validaciones.
- ✅ Panel probado de punta a punta en modo demo.
- ⚠️ **NO probado contra Firestore real, Cloudinary real ni PayPal real** (sin acceso desde mi entorno). Haz las pruebas del apartado 6 antes de cobrar.
- ⚠️ **Límite de CPU del plan gratuito de Cloudflare: 10 ms por petición.** Una página de Next.js puede acercarse. No he podido medirlo. Si en producción ves errores "1102" o páginas lentas, la solución es el plan de pago de Workers (5 $/mes, requiere tarjeta) o simplificar páginas. Compruébalo con la tienda abierta unos días.

## 4. Puesta en marcha

**Ya hecho por ti:** proyecto Firebase `moda-enma` (Spark), reglas de Firestore, usuario administrador y `set-admin`, productos de prueba.

1. **Cloudinary:** en Settings → Upload → *Upload presets* crea un preset en modo **Unsigned** (limita formatos a imágenes). Apunta tu *Cloud Name* y el nombre del preset.
2. **Panel** (`pagina_inma/.env`): quita `VITE_FIREBASE_STORAGE_BUCKET` y añade
   `VITE_CLOUDINARY_CLOUD_NAME=` y `VITE_CLOUDINARY_UPLOAD_PRESET=`. Luego `npm run build` y, desde la raíz, `firebase deploy --only firestore:rules,hosting`.
   (Si `firebase deploy` se queja de Storage, comprueba que `firebase.json` ya no lo menciona: esta versión lo quita.)
3. **Tienda en local** (`moda-enma-tienda/.env.local`): igual que antes (claves públicas de Firebase + `FIREBASE_SERVICE_ACCOUNT_KEY`). Quita `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` si quieres. Para ver cómo corre como en Cloudflare: copia las variables a `.dev.vars` (el JSON de la cuenta de servicio entre comillas simples) y ejecuta `npm run preview`.
4. **Cloudflare** (dash.cloudflare.com → Workers & Pages → Create → *Import a repository*, sin tarjeta):
   - Repo `pagina_enma`, rama `main` (tras fusionar la rama `launch/modaenma-v2`).
   - Directorio raíz: `moda-enma-tienda`. Nombre del Worker: `modaenma-tienda` (debe coincidir con `wrangler.jsonc`).
   - Build command: `npx opennextjs-cloudflare build`. Deploy command: `npx opennextjs-cloudflare deploy`.
   - **Variables de compilación** (Build → Variables), necesarias porque `NEXT_PUBLIC_*` se incrustan al compilar: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_SITE_URL`.
   - **Variables y secretos de ejecución** (Settings → Variables and Secrets): las mismas `NEXT_PUBLIC_*` y además, como *Secret*: `FIREBASE_SERVICE_ACCOUNT_KEY` (pega el JSON completo), `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`; y como variable `PAYPAL_ENV` (`sandbox` o `live`).
   - Alternativa desde tu terminal: `cd moda-enma-tienda && npx wrangler login && npm run deploy`.
5. **Dominio:** cuando lo tengas, ponlo en `site.config.js` (`brand.domain`), ejecuta `node scripts/sync-shared.mjs`, y añádelo en el Worker (Settings → Domains & Routes). Si compras el dominio en Cloudflare todo queda en el mismo sitio.
6. **Autorizar el panel:** en Firebase → Authentication → Settings → *Dominios autorizados* añade el dominio del panel (`moda-enma.web.app` ya viene).
7. **Productos reales:** súbelos desde el panel y borra los de prueba (Ajustes).

## 5. PayPal (cuando crees la cuenta Business)
1. developer.paypal.com → Apps & Credentials → crea una app (primero **Sandbox**) → Client ID y Secret.
2. En Cloudflare: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (variable de compilación y de ejecución), `PAYPAL_CLIENT_SECRET` (secreto), `PAYPAL_ENV=sandbox`. Vuelve a desplegar (el Client ID se incrusta al compilar).
3. Webhooks → `https://TU-DOMINIO/api/paypal/webhook` con `PAYMENT.CAPTURE.COMPLETED`, `DENIED`, `REFUNDED`, `REVERSED`. Copia el *Webhook ID* a `PAYPAL_WEBHOOK_ID`.
4. Cuando todo funcione en sandbox: `PAYPAL_ENV=live` con credenciales **live** y nuevo despliegue.

Cómo funciona: al confirmar, el servidor crea el pedido y **reserva el stock** en una transacción; PayPal cobra; el servidor captura y solo entonces lo marca pagado (comprueba importe y moneda). Si el cliente abandona, se libera el stock; si cierra el navegador a medias, cancelas el pedido desde el panel.

**Cuotas gratuitas a vigilar:** Firestore Spark da 50.000 lecturas y 20.000 escrituras al día; Cloudflare Workers, 100.000 peticiones al día. Sobra para empezar; el panel de cada servicio muestra el consumo.

## 5b. Correos al cliente y WhatsApp (sin coste)

**Qué hace:**
- Al comprar (pago en mano al crear el pedido; PayPal cuando el pago se confirma) el cliente recibe un correo con su pedido y el total. Si elige **quedar en persona**, el correo le dice que quedáis en Málaga y que **día, hora y lugar se acuerdan por WhatsApp**, con un botón que abre tu WhatsApp (+34 610 71 29 27) con el mensaje ya escrito.
- Al cambiar el estado desde el panel (Preparando, Enviado, Entregado, Cancelado) se le avisa por correo. En "Enviado" va el código de seguimiento que escribas en el pedido. Hay una casilla para no avisar si no quieres.
- En la ficha de cada prenda hay un enlace "¿Dudas con la talla o las medidas? Pregúntame por WhatsApp" con el nombre, la talla elegida y el enlace.
- El panel marca "Sin talla M" y "Última: S" en cada producto, y el aviso de stock bajo salta con 1 unidad o menos.
- Si un correo falla, **la compra no se rompe**: el pedido muestra un aviso en el panel y le escribes por WhatsApp.
- Tú no recibes correos ni WhatsApp automáticos de los pedidos (se deja para más adelante). Los ves al instante en el panel, en "Pedidos".

**Puesta en marcha del correo con Brevo (gratis, 300 al día, sin dominio propio):**
1. Crea cuenta en brevo.com → *Senders, Domains & Dedicated IPs* → *Senders* → añade tu correo de tienda y confírmalo (te llega un enlace). Sin dominio propio, los correos pueden caer en spam más a menudo; con dominio (y registros SPF/DKIM que Brevo te indica) mejora mucho.
2. *SMTP & API* → *API Keys* → crea una clave.
3. En Cloudflare (Worker `modaenma-tienda` → Settings → Variables and Secrets): secreto `BREVO_API_KEY`; variable `EMAIL_FROM` (el correo que verificaste); opcional `EMAIL_FROM_NAME` y `EMAIL_REPLY_TO`.
4. Brevo añade siempre "Sent with Brevo" en el plan gratuito. Cuando tengas dominio puedes pasar a **Resend** cambiando `RESEND_API_KEY` en lugar de `BREVO_API_KEY` (y `EMAIL_PROVIDER=resend`); el código ya lo soporta.
5. **Para que el panel pueda avisar por correo:** en GitHub → Settings → Secrets and variables → Actions, crea el secreto `VITE_STORE_URL` con la dirección de la tienda (sin barra final, p. ej. `https://modaenma-tienda.TUUSUARIO.workers.dev`). Vuelve a ejecutar el workflow del panel (o sube cualquier cambio a `pagina_inma/`). En local, ponlo también en `pagina_inma/.env`.
6. El panel puede llamar a la tienda sin configurar nada más si está en `https://moda-enma.web.app` o `.firebaseapp.com`. Si usas otro dominio para el panel, añádelo en Cloudflare como variable `PANEL_ORIGIN` (varios separados por comas).

**Qué NO está hecho (por decisión tuya):** chatbot de WhatsApp, aviso automático de pedidos a tu móvil y horarios fijos para quedar. Para avisarte a ti, las opciones estudiadas son Telegram (gratis) o WhatsApp oficial de Meta (de pago por mensaje).

## 6. Pruebas que debes hacer antes de abrir al público
- [ ] Compra de prueba con PayPal **Sandbox**: aparece en el panel como "PayPal · pagado" y el stock baja.
- [ ] Abandonar el pago de PayPal: el pedido no queda como pagado y el stock se libera.
- [ ] Compra "quedar en persona + pago en mano": entra en el panel como "Cobrar en mano".
- [ ] Dos personas compran la última unidad a la vez: solo una lo consigue.
- [ ] Cancelar un pedido en el panel devuelve el stock a la tienda.
- [ ] Subir un producto con 3 fotos desde el móvil: se ve en la tienda sin recargar el panel.
- [ ] Compra de prueba (pago en mano + quedar en persona): llega el correo al cliente con el botón de WhatsApp, y el botón abre tu chat con el mensaje escrito.
- [ ] Cambiar un pedido a "Enviado" con código de seguimiento: llega el correo con el código. Probar también con un correo inventado: debe salir el aviso de que no se pudo enviar, sin romper nada.
- [ ] Desde la ficha de una prenda, el enlace de WhatsApp abre tu chat con el nombre y la talla.
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
