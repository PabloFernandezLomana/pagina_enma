# Puntos de Enganche para Automatizaciones Futuras (n8n)

> Este documento detalla la arquitectura de integración para cuando se incorpore n8n tras el lanzamiento oficial. No introduce código activo ni dependencias en la versión actual de lanzamiento.

---

## 1. Disparadores de Eventos (Event Triggers)

### Evento: Pedido Creado (`orders` en Firestore)
- **Origen**: Route Handler de Next.js (`/api/orders/create` o `/api/paypal/capture-order`).
- **Punto de conexión recomendado**:
  - Webhook saliente POST desde la función del servidor hacia `https://n8n.tudominio.com/webhook/nuevo-pedido`.
  - O Cloud Function en Firestore `onDocumentCreated('orders/{orderId}')`.
- **Payload esperado**:
  ```json
  {
    "orderId": "PED-2026-105",
    "clientName": "Nombre Cliente",
    "clientPhone": "600123456",
    "clientEmail": "cliente@email.com",
    "paymentMethod": "cash | paypal",
    "paymentStatus": "pending | paid",
    "total": 45.00,
    "items": [
      {
        "productName": "Vestido Midi Floral",
        "size": "M",
        "quantity": 1,
        "unitPrice": 45.00
      }
    ],
    "createdAt": "2026-11-20T20:00:00.000Z"
  }
  ```

---

## 2. Acciones Previstas en n8n
1. **Generación y Envío Automático de Factura en PDF**:
   - Envío por correo o WhatsApp Business API al completarse el cobro.
2. **Notificación al Móvil de la Dueña**:
   - Mensaje push / Telegram / WhatsApp avisando del nuevo pedido ("¡Nuevo pedido para cobrar en mano en Málaga!").
3. **Widget Asistente de Outfits / Chatbot**:
   - Se habilitará en la tienda mediante un script diferido sin impactar en las métricas Web Vitals.

