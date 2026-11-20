// Demo dataset for testing features

export const DEMO_PRODUCTS = [
  {
    id: "prod-demo-1",
    name: "Vestido Midi Lino Estampado Floral",
    sku: "VEST-FLOR-01",
    category: "Vestidos",
    costPrice: 24.00,
    salePrice: 65.00,
    lowStockThreshold: 3,
    active: true,
    description: "Vestido de lino 100% natural con escote en V, cintura ajustada y vuelo ligero.",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    variants: [
      { size: "XS", color: "Verde Salvia", stock: 2 },
      { size: "S", color: "Verde Salvia", stock: 4 },
      { size: "M", color: "Verde Salvia", stock: 5 },
      { size: "L", color: "Verde Salvia", stock: 3 },
      { size: "XL", color: "Verde Salvia", stock: 1 }
    ]
  },
  {
    id: "prod-demo-2",
    name: "Blusa Seda Natural Verde Salvia",
    sku: "BLUS-SEDA-02",
    category: "Blusas",
    costPrice: 18.50,
    salePrice: 49.90,
    lowStockThreshold: 3,
    active: true,
    description: "Blusa fluida de tacto sedoso con cuello mao y botones de nácar.",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=600&q=80",
    variants: [
      { size: "S", color: "Verde Salvia", stock: 1 },
      { size: "M", color: "Verde Salvia", stock: 2 },
      { size: "L", color: "Verde Salvia", stock: 0 }
    ]
  }
];

export const DEMO_CLIENTS = [
  {
    id: "cli-demo-1",
    name: "María García López",
    phone: "612345678",
    email: "maria.garcia@example.com",
    address: "Calle Sierpes 42, 2ºA",
    city: "Sevilla",
    postalCode: "41004",
    clientType: "Cliente VIP",
    notes: "Le encantan los vestidos de lino y los tonos pastel.",
    createdAt: "2026-08-01",
    totalSpent: 114.90,
    lastPurchaseDate: "2026-08-04"
  },
  {
    id: "cli-demo-2",
    name: "Carmen Benítez",
    phone: "622998877",
    email: "carmen.boutique@example.com",
    address: "Avenida de la Constitución 15",
    city: "Málaga",
    postalCode: "29001",
    clientType: "Minorista",
    notes: "Compradora frecuente de blusas y conjuntos.",
    createdAt: "2026-08-10",
    totalSpent: 350.00,
    lastPurchaseDate: "2026-08-20"
  },
  {
    id: "cli-demo-3",
    name: "Boutique Moda Real",
    phone: "633445566",
    email: "contacto@modareal.es",
    address: "Gran Vía 88",
    city: "Madrid",
    postalCode: "28013",
    clientType: "Mayorista",
    notes: "Pedidos por volumen. Requiere envío urgente.",
    createdAt: "2026-08-15",
    totalSpent: 1200.00,
    lastPurchaseDate: "2026-08-25"
  }
];

export const DEMO_ORDERS = [
  {
    id: "PED-2026-001",
    clientId: "cli-demo-1",
    clientName: "María García López",
    clientPhone: "612345678",
    clientEmail: "maria.garcia@example.com",
    items: [
      { productId: "prod-demo-1", productName: "Vestido Midi Lino Estampado Floral", size: "M", color: "Verde Salvia", quantity: 1, unitPrice: 65.00 },
      { productId: "prod-demo-2", productName: "Blusa Seda Natural Verde Salvia", size: "S", color: "Verde Salvia", quantity: 1, unitPrice: 49.90 }
    ],
    subtotal: 114.90,
    discount: 0,
    shippingCost: 0,
    total: 114.90,
    status: "Entregado",
    paymentMethod: "Bizum",
    shippingMethod: "Envío Estándar",
    notes: "Dejar en portería si no responde.",
    createdAt: new Date().toISOString(),
    invoiceGenerated: true,
    invoiceId: "FACT-2026-001"
  }
];

export const DEMO_INVOICES = [
  {
    id: "FACT-2026-001",
    orderId: "PED-2026-001",
    clientName: "María García López",
    clientAddress: "Calle Sierpes 42, 2ºA, Sevilla",
    clientNif: "48291048K",
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: "Vestido Midi Lino Estampado Floral (Talla M)", quantity: 1, price: 65.00, total: 65.00 },
      { name: "Blusa Seda Natural Verde Salvia (Talla S)", quantity: 1, price: 49.90, total: 49.90 }
    ],
    subtotal: 94.96,
    vat: 19.94,
    total: 114.90,
    status: "Pagada"
  }
];

export const DEMO_TEMPLATES = [
  {
    id: "tpl-1",
    title: "Confirmación de Pedido",
    type: "whatsapp",
    content: "¡Hola {nombre}! 🌸 Muchas gracias por tu compra en ModaInma Boutique. Confirmamos que hemos recibido tu pedido #{pedido} por un total de {total}€. Te avisaremos en cuanto esté en camino."
  },
  {
    id: "tpl-2",
    title: "Pedido Enviado con Seguimiento",
    type: "whatsapp",
    content: "¡Buenas noticias, {nombre}! ✨ Tu pedido #{pedido} ya ha sido enviado y está en camino a tu dirección. Saludos de ModaInma."
  }
];

export const DEMO_TASKS = [
  { id: "task-demo-1", text: "Probar descarga de factura en PDF", completed: false, date: new Date().toISOString().split('T')[0] }
];
