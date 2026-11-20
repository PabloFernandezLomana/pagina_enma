# 🛒 ModaEnma | Tienda Online Pública (E-Commerce)

**ModaEnma** es la plataforma e-commerce pública de la boutique, diseñada bajo la estética editorial de alta gama (**Zara / Mango**). Ofrece una experiencia de compra minimalista, catálogo multicategoría (Mujer, Hombre, Niños, Deporte y Accesorios), animaciones fluidas con **GSAP**, componentes interactivos inspirados en **reactbits.dev**, elementos 3D con **React Three Fiber (R3F)** y sincronización en tiempo real con el panel interno de gestión **ModaInma Management**.

---

## ⚡ 1. Guía de Conexión a Firebase (Mismo Backend que ModaInma Management)

Para sincronizar el catálogo de productos, el stock por talla y la recepción de pedidos en tiempo real con la app de gestión, crea un archivo `.env.local` en la raíz de `moda-enma-tienda/` con las credenciales de tu consola Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

> **Nota de Fallback en Desarrollo:** Si las variables `.env.local` aún no están creadas, la tienda funcionará en modo de demostración reactivo con un catálogo precargado y guardará los pedidos en `localStorage`, permitiendo probar la web visualmente y probar el flujo de compra de inmediato.

---

## 🔐 2. Reglas de Seguridad en Cloud Firestore (`firestore.rules`)

Copia y despliega las siguientes reglas de seguridad en la consola de Firebase para proteger los datos internos de la boutique mientras permites las ventas públicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1. Catálogo de Productos: Lectura pública de prendas activas
    match /products/{productId} {
      allow read: if resource == null || resource.data.active == true || request.auth != null;
      allow write: if request.auth != null;
    }

    // 2. Pedidos: La tienda pública puede CREAR nuevos pedidos (los administradores los gestionan)
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    // 3. Opcional: Clientes y Facturas (acceso restringido a admin)
    match /clients/{clientId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }

    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🎨 3. Resumen de Componentes Animados (GSAP + ReactBits) y 3D (R3F)

| Componente | Origen / Tecnología | Ubicación | Descripción |
| :--- | :--- | :--- | :--- |
| `SplitTextReveal.js` | Inspirado en **reactbits.dev** + GSAP | Home Hero Headline | Revelado carácter a carácter de títulos editoriales con rotación 3D en eje X. |
| `ScrollReveal.js` | GSAP + ScrollTrigger | Home & Listados | Fades y desplazamientos suaves activados al hacer scroll en secciones y grids. |
| `SpotlightCard.js` | Inspirado en **reactbits.dev** | Tarjetas de Producto | Destello radial sutil con gradiente suave que sigue la posición del ratón. |
| `MarqueeBar.js` | CSS Keyframes + React | Home Banner | Marquesina de texto continua con anuncios de colección y ventajas. |
| `HeroScene3D.js` | React Three Fiber (R3F) | Hero Home | Escena 3D interactiva con emblema geométrico flotante, reflejos y respuesta al ratón. |
| `ProductViewer3D.js` | R3F + Three.js OrbitControls | Ficha PDP (Botellas/Accesorios) | Visor 3D 360° para inspeccionar acabados metálicos (Plata Titanio, Obsidiana, Oro Rosa). |

---

## 🛠️ 4. Comandos para Desarrollo y Despliegue

```bash
# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# Compilar build optimizada para producción (SEO / SSR / SSG)
npm run build

# Iniciar servidor de producción compilado
npm run start
```

---

## 🔮 5. Mejoras Opcionales para Fase 2

1. **Firebase Auth en E-Commerce**: Permitir que los clientes creen cuenta de usuario con Google/Email para guardar direcciones habituales y ver el historial de sus pedidos.
2. **Stripe Webhooks**: Conectar webhooks serverless de Stripe en Next.js (`/api/webhooks/stripe`) para cambiar automáticamente el estado del pedido de `'Pendiente'` a `'Confirmado'` al recibir la notificación de pago completado.
