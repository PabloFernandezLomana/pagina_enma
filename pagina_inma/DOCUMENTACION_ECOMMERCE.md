# 🛒 Guía de Integración Futura con Tienda Online (E-Commerce)

Esta documentación detalla la arquitectura de datos y la preparación de **Cloud Firestore** para conectar una tienda online pública (frontend e-commerce) que comparta el catálogo, control de stock en tiempo real y flujo de pedidos con la herramienta interna **ModaInma Management**.

---

## 🏗️ 1. Arquitectura de Colecciones Compartidas en Firestore

Ambas aplicaciones (la app interna de gestión y la tienda online pública) utilizarán la misma instancia de Firestore:

```
Cloud Firestore
├── /products/{productId}       # Catálogo de ropa, fotos, precios PVP y matriz de stock por talla
├── /orders/{orderId}           # Embudo de pedidos (Ventas internas + Pedidos de la tienda online)
├── /clients/{clientId}         # CRM unificado de compradores
├── /invoices/{invoiceId}       # Facturas emitidas por la boutique
└── /templates/{templateId}     # Plantillas de notificación WhatsApp
```

---

## 🔐 2. Reglas de Seguridad en Cloud Firestore (`firestore.rules`)

Para permitir que los visitantes de la tienda online consulten el catálogo y realicen compras sin comprometer los datos privados de la boutique, copia estas reglas en tu consola de Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1. Catálogo de Productos: Lectura pública de productos activos, escritura solo por admin autenticado
    match /products/{productId} {
      allow read: if resource == null || resource.data.active == true || request.auth != null;
      allow write: if request.auth != null;
    }

    // 2. Pedidos: La tienda online pública puede CREAR un nuevo pedido. Lectura/Edición solo por el admin
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    // 3. Fichas de Clientes: Permite crear/registrar clientes en compras online
    match /clients/{clientId} {
      allow create, read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // 4. Facturas y Tareas: Exclusivo para la jefa/administrador autenticado
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null;
    }

    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ⚡ 3. Automatización de Stock con Cloud Functions (Triggers en la Nube)

Para garantizar que cuando entre un pedido desde la tienda online el stock de la talla correspondiente se descuente inmediatamente en el panel interno de ModaInma, se puede desplegar la siguiente **Firebase Cloud Function**:

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Trigger al crear un pedido nuevo desde la web pública
export const onOnlineOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    if (!orderData || !orderData.items) return;

    const batch = db.batch();

    for (const item of orderData.items) {
      const productRef = db.collection("products").doc(item.productId);
      const productDoc = await productRef.get();

      if (productDoc.exists) {
        const product = productDoc.data();
        const updatedVariants = (product?.variants || []).map((v: any) => {
          if (v.size === item.size) {
            return { ...v, stock: Math.max(0, v.stock - item.quantity) };
          }
          return v;
        });

        batch.update(productRef, { variants: updatedVariants });
      }
    }

    await batch.commit();
    console.log(`Stock actualizado automáticamente para pedido ${context.params.orderId}`);
  });
```

---

## 📱 4. Flujo de Notificaciones de Ventas en Tiempo Real

1. **Cliente entra en la tienda online** ➔ Selecciona prenda y talla ➔ Realiza el pago (Stripe/Bizum).
2. **E-Commerce crea documento en `/orders`** con estado `'Confirmado'` y los campos `origin: 'online'`.
3. **Cloud Function deduce automáticamente el stock** por talla en `/products`.
4. **ModaInma Management** recibe la notificación `onSnapshot` instantáneamente en la pantalla de la boutique, haciendo sonar un aviso y mostrando el nuevo pedido en el embudo.
5. **Administradora envía el paquete**, cambia el estado a `'Enviado'` / `'Entregado'`, generando el PDF de factura en 1 clic.

---
*Documento preparado como especificación técnica para la fase 2 de e-commerce.*
