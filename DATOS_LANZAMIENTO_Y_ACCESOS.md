# DATOS_LANZAMIENTO_Y_ACCESOS.md — Guía para el Dueño / Administrador

**Fecha**: 20 de Noviembre de 2026  
**Objetivo de Lanzamiento**: 24-25 de Noviembre de 2026  
**Proyecto**: ModaEnma (Tienda Pública) + ModaInma Management (Panel Privado)

---

## 1. Cómo acceder y arrancar las aplicaciones

### En tu ordenador de desarrollo (Local):
Ambas aplicaciones conviven en la misma carpeta raíz y se ejecutan en puertos independientes:

1. **Tienda Pública (Next.js)**:
   - **URL Local**: [http://localhost:3000](http://localhost:3000)
   - **Comando de arranque**:
     ```bash
     cd moda-enma-tienda
     npm run dev
     ```
   - **Nota**: El botón "PANEL ADMIN" fue eliminado de la tienda pública por seguridad y privacidad (el cliente general nunca debe ver enlaces al panel de gestión interno).

2. **Panel de Gestión de la Boutique (React + Vite)**:
   - **URL Local**: [http://localhost:5173](http://localhost:5173)
   - **Comando de arranque**:
     ```bash
     cd pagina_inma
     npm run dev
     ```
   - **Cómo entrar**:
     - Accede directamente a `http://localhost:5173`.
     - Si tienes Firebase Auth activo con usuarios administradores, introduce tu email y contraseña.
     - Si Firebase está en modo desarrollo/offline, el panel entra automáticamente a la vista de gestión completa con diseño Stitch (menú lateral rosa pastel, pedidos Kanban, catálogo y facturación).

---

## 2. Datos que necesitas aportarme / rellenar (`TODO-LANZAMIENTO`)

Todo se encuentra centralizado en el archivo `site.config.js` en la raíz del proyecto. Solo tienes que editar ese archivo (o pasármelos para que los introduzca yo):

### A. Datos Fiscales y de Contacto (Obligatorios para la UE)
- [ ] **Razón Social o Nombre del Autónomo**: Nombre y apellidos del titular o nombre de la sociedad.
- [ ] **NIF o CIF**: Número de identificación fiscal.
- [ ] **Dirección de la Boutique / Domicilio Social**: Calle, número, código postal y ciudad (Málaga).
- [ ] **Teléfono y WhatsApp**: Número de atención al cliente (con prefijo +34).
- [ ] **Email de Atención**: Correo para consultas y confirmación de pedidos (ej. `info@modainma.com` o `contacto@modainma.com`).

### B. Pasarela de Pago PayPal
- [ ] **PayPal Business**:
  1. Entrar en [developer.paypal.com](https://developer.paypal.com) con la cuenta de PayPal del negocio.
  2. Crear una App en "Apps & Credentials".
  3. Copiar:
     - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
     - `PAYPAL_CLIENT_SECRET`
  4. Para probar antes del día 24, creamos una cuenta **Sandbox** (dinero ficticio). El día del lanzamiento se cambia a **Live**.

### C. Redes Sociales
- [ ] **Enlace de Instagram**: ej. `https://instagram.com/modainma`
- [ ] **Enlace / Teléfono de WhatsApp**: ej. `+346XXXXXXXX` (se generará automáticamente el botón flotante y el enlace de contacto del pie).
- *(TikTok o Facebook son opcionales: si no los tienes, los botones quedan ocultos automáticamente sin dejar huecos vacíos)*.

### D. Envíos y Horarios Locales (Málaga)
- [ ] **Horario de recogida en tienda**: ej. *Lunes a Viernes de 10:00 a 14:00 y 17:30 a 20:30*.
- [ ] **Coste de envío local**: Configurado por defecto en **3,90 €** (puedes cambiarlo).
- [ ] **Envío gratis a partir de**: Configurado por defecto en **60,00 €** (puedes cambiarlo).

---

## 3. Dominio y Despliegue en Producción

Para que la tienda y el panel estén online para todo el público:
- **Tienda**: Recomendado en subdominio principal: `www.tudominio.com` (o `modainma.com`).
- **Panel**: Recomendado en subdominio privado: `gestion.tudominio.com` o `panel.modainma.com` (con etiqueta `noindex` para que Google no lo muestre en búsquedas).
- **Alojamiento Recomendado**:
  - Tienda: **Firebase App Hosting** (requiere activar el plan Blaze de Google Cloud, que es gratuito hasta cierto volumen y luego céntimos por uso).
  - Panel: **Firebase Hosting** (gratuito).

---

## 4. Cómo gestionar tu tienda en el día a día

1. **Subir una prenda nueva**:
   - Entra en `Productos` en el panel (`localhost:5173`).
   - Pulsa el botón "Añadir Producto".
   - Arrastra fotos o súbelas desde el móvil (se comprimen solas para no ocupar espacio).
   - Elige portada pulsando la estrella ★.
   - Pon nombre, precio y reparte las unidades por talla (XS, S, M, L, XL).
   - Pulsa "Publicar". En segundos aparecerá en la tienda pública.
2. **Atender un pedido nuevo**:
   - Entra en `Pedidos` en el panel.
   - Verás tarjetas con la etiqueta **WEB**.
   - Si eligió **Cobrar en mano**, verás el chip amarillo. Cuando te pague en persona o al entregarlo, pulsa **"✓ Marcar como Cobrado"**.
   - Puedes pulsar el botón verde de **WhatsApp** en la tarjeta para avisar al cliente con un mensaje ya redactado de que su pedido está listo o en camino.
   - Si un cliente cancela, pulsa **"Cancelar Pedido"** y el stock volverá automáticamente a la tienda sin que tengas que sumarlo a mano.
3. **Limpiar datos demo antes del lanzamiento**:
   - Hemos dejado un script en `scripts/backup-and-purge.js`. Cuando tengas las prendas reales listas, te ayudaré a hacer la copia de seguridad y dejar el panel con 0 pedidos y 0 datos de prueba.

