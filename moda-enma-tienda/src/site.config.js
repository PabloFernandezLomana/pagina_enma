// site.config.js - Configuración centralizada de ModaEnma / ModaInma
// Todos los textos, políticas, datos de contacto y condiciones leen de aquí.
// Los datos pendientes marcados con TODO-LANZAMIENTO requieren confirmación del usuario.

export const SITE_CONFIG = {
  brand: {
    name: "ModaEnma",
    legalName: "TODO-LANZAMIENTO: Razón Social o Nombre Autónomo",
    nif: "TODO-LANZAMIENTO: NIF/CIF",
    tagline: "Boutique cálida de moda y estilo de vida en Málaga",
    description: "Ropa pensada para el día a día, colecciones seleccionadas con mimo y artículos exclusivos.",
    city: "Málaga",
    country: "España",
    address: "TODO-LANZAMIENTO: Dirección física de la boutique en Málaga",
    phone: "TODO-LANZAMIENTO: Teléfono de atención al cliente",
    whatsapp: "TODO-LANZAMIENTO: Número de WhatsApp comercial",
    email: "TODO-LANZAMIENTO: Correo de contacto comercial",
  },

  social: {
    instagram: "TODO-LANZAMIENTO: https://instagram.com/...",
    tiktok: "", // Dejar vacío si no se usa; el botón no se mostrará
    facebook: "", // Dejar vacío si no se usa
    whatsappLink: "TODO-LANZAMIENTO: https://wa.me/34XXXXXXXXX"
  },

  shipping: {
    scope: "Málaga Capital y alrededores seleccionados",
    localDeliveryCost: 4.90, // En euros por pedido
    freeShippingThreshold: 999999, // Sin envíos gratuitos (siempre aplica coste de reparto)
    allowStorePickup: false, // Solo venta y entrega online directa
    pickupAddress: "",
    pickupSchedule: "",
    postalCodesAllowedForCash: [
      "29001", "29002", "29003", "29004", "29005", "29006", "29007", "29008", 
      "29009", "29010", "29011", "29012", "29013", "29014", "29015", "29016", 
      "29017", "29018"
    ]
  },

  payments: {
    allowedMethods: ['paypal', 'cash'],
    cashOnDeliveryName: "Pago en mano (Recogida o Entrega en Málaga)",
    paypalEnabled: true,
    cashEnabled: true
  },

  legal: {
    withdrawalDays: 14, // 14 días naturales derecho de desistimiento
    taxIncludedText: "Todos los precios incluyen IVA",
    cookiesPolicyVersion: "1.0 - Noviembre 2026"
  }
};

export default SITE_CONFIG;

