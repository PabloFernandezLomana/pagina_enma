export const CATEGORIES = [
  { id: 'mujer', name: 'Mujer', label: 'MUJER', desc: 'Colección cápsula de moda femenina con cortes impecables.' },
  { id: 'hombre', name: 'Hombre', label: 'HOMBRE', desc: 'Sastrería contemporánea y prendas esenciales para él.' },
  { id: 'ninos', name: 'Niños', label: 'NIÑOS', desc: 'Prendas duraderas, cómodas y elegantes para los más pequeños.' },
  { id: 'deporte', name: 'Deporte', label: 'DEPORTE', desc: 'Equipamiento técnico, ropa de alto rendimiento y artículos deportivos.' },
  { id: 'accesorios', name: 'Accesorios', label: 'ACCESORIOS', desc: 'Botellas térmicas de acero, complementos, marroquinería y esenciales.' },
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-enma-01",
    name: "Vestido Midi Lino Estampado Floral",
    sku: "VEST-FLOR-01",
    category: "Mujer",
    costPrice: 24.00,
    salePrice: 79.90,
    lowStockThreshold: 3,
    active: true,
    description: "Vestido de lino 100% natural con escote en V, cintura ajustada y vuelo ligero. Diseño de alta costura confeccionado para resaltar una silueta fluida y veraniega.",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "XS", color: "Verde Salvia", stock: 2 },
      { size: "S", color: "Verde Salvia", stock: 4 },
      { size: "M", color: "Verde Salvia", stock: 5 },
      { size: "L", color: "Verde Salvia", stock: 3 },
      { size: "XL", color: "Verde Salvia", stock: 1 }
    ],
    isFeatured: true,
    tag: "Novedad"
  },
  {
    id: "prod-enma-02",
    name: "Blusa Seda Natural Verde Salvia",
    sku: "BLUS-SEDA-02",
    category: "Mujer",
    costPrice: 18.50,
    salePrice: 65.00,
    lowStockThreshold: 3,
    active: true,
    description: "Blusa fluida en 100% seda de mora con cuello mao y botones de nácar natural esculpidos a mano. Sensación ultraligera y acabado satinado.",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "XS", color: "Verde Salvia", stock: 1 },
      { size: "S", color: "Verde Salvia", stock: 2 },
      { size: "M", color: "Verde Salvia", stock: 3 },
      { size: "L", color: "Verde Salvia", stock: 0 },
      { size: "XL", color: "Verde Salvia", stock: 0 }
    ],
    isFeatured: true,
    tag: "Edición Limitada"
  },
  {
    id: "prod-enma-03",
    name: "Blazer Estructurada Sarga Lana",
    sku: "BLAZ-LANA-03",
    category: "Mujer",
    costPrice: 45.00,
    salePrice: 129.00,
    lowStockThreshold: 2,
    active: true,
    description: "Americana cruzada de solapa de pico y hombreras marcadas. Confeccionada en mezcla de lana virgen con sarga de acabado estructurado.",
    image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "XS", color: "Rosa Empolvado", stock: 3 },
      { size: "S", color: "Rosa Empolvado", stock: 5 },
      { size: "M", color: "Rosa Empolvado", stock: 4 },
      { size: "L", color: "Rosa Empolvado", stock: 2 },
      { size: "XL", color: "Rosa Empolvado", stock: 1 }
    ],
    isFeatured: false,
    tag: "Essential"
  },
  {
    id: "prod-enma-04",
    name: "Abrigo Manteau Minimalista Negro",
    sku: "ABRI-MAN-04",
    category: "Hombre",
    costPrice: 65.00,
    salePrice: 189.00,
    lowStockThreshold: 2,
    active: true,
    description: "Abrigo largo con cuello de solapa y cierre botonadura oculta. Diseño minimalista con silueta recta impecable y forro interior satinado.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "S", color: "Negro", stock: 2 },
      { size: "M", color: "Negro", stock: 4 },
      { size: "L", color: "Negro", stock: 5 },
      { size: "XL", color: "Negro", stock: 2 }
    ],
    isFeatured: true,
    tag: "Colección Invierno"
  },
  {
    id: "prod-enma-05",
    name: "Camisa Algodón Puro Algodonero",
    sku: "CAM-ALG-05",
    category: "Hombre",
    costPrice: 15.00,
    salePrice: 59.00,
    lowStockThreshold: 4,
    active: true,
    description: "Camisa de corte entallado en popelín de algodón 100% transpirable. Cuello italiano y puños ajustables.",
    image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "S", color: "Blanco Óptico", stock: 6 },
      { size: "M", color: "Blanco Óptico", stock: 8 },
      { size: "L", color: "Blanco Óptico", stock: 7 },
      { size: "XL", color: "Blanco Óptico", stock: 3 }
    ],
    isFeatured: false,
    tag: "Básico Premium"
  },
  {
    id: "prod-enma-06",
    name: "Jersey Punto Fino Lana Merino",
    sku: "JERS-MER-06",
    category: "Niños",
    costPrice: 12.00,
    salePrice: 39.90,
    lowStockThreshold: 3,
    active: true,
    description: "Jersey de punto suave para niños sin costuras irritantes. Acabado elástico en puños y bajo.",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "4-6 Años", color: "Crema", stock: 5 },
      { size: "6-8 Años", color: "Crema", stock: 4 },
      { size: "8-10 Años", color: "Crema", stock: 3 },
      { size: "10-12 Años", color: "Crema", stock: 2 }
    ],
    isFeatured: false,
    tag: "Junior Collection"
  },
  {
    id: "prod-enma-07",
    name: "Botella Térmica Metalizada Pro 750ml",
    sku: "BOT-MET-07",
    category: "Accesorios",
    costPrice: 9.50,
    salePrice: 29.90,
    lowStockThreshold: 5,
    active: true,
    description: "Botella de doble pared de acero inoxidable de grado quirúrgico 18/8 con acabado metálico cepillado premium. Mantiene las bebidas frías 24h o calientes 12h. Incluye visor 3D en la ficha.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1000&q=85"
    ],
    isOneSize: true,
    variants: [
      { size: "Única", color: "Plata Titanio", stock: 15 }
    ],
    isFeatured: true,
    is3d: true,
    tag: "Pieza Icónica"
  },
  {
    id: "prod-enma-08",
    name: "Camiseta Técnica Running Pro Performance",
    sku: "CAM-DEP-08",
    category: "Deporte",
    costPrice: 11.00,
    salePrice: 34.90,
    lowStockThreshold: 4,
    active: true,
    description: "Camiseta deportiva ultraligera con microperforaciones láser para ventilación activa constante. Tejido secado rápido QuickDry.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: [
      { size: "S", color: "Negro Carbón", stock: 6 },
      { size: "M", color: "Negro Carbón", stock: 8 },
      { size: "L", color: "Negro Carbón", stock: 5 },
      { size: "XL", color: "Negro Carbón", stock: 2 }
    ],
    isFeatured: true,
    tag: "Performance"
  },
  {
    id: "prod-enma-09",
    name: "Balón Oficial Fútbol Competición ModaEnma",
    sku: "BAL-FUT-09",
    category: "Deporte",
    costPrice: 16.00,
    salePrice: 44.90,
    lowStockThreshold: 3,
    active: true,
    description: "Balón de fútbol termo-sellado con aerodinámica de precisión. Acabado de textura rugosa antideslizante para máximo control.",
    image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=1000&q=85"
    ],
    isOneSize: true,
    variants: [
      { size: "Talla 5", color: "Blanco / Negro / Dorado", stock: 10 }
    ],
    isFeatured: false,
    tag: "Fútbol Pro"
  },
  {
    id: "prod-enma-10",
    name: "Bolso Tote Cuero Granulado Minimal",
    sku: "BOLS-CUE-10",
    category: "Accesorios",
    costPrice: 38.00,
    salePrice: 119.00,
    lowStockThreshold: 2,
    active: true,
    description: "Bolso shopper estructurado en piel vacuno de curtición vegetal. Asas reforzadas para hombro y bolsillo interior con cremallera metálica.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85"
    ],
    isOneSize: true,
    variants: [
      { size: "Única", color: "Negro Azabache", stock: 4 }
    ],
    isFeatured: true,
    tag: "Marroquinería"
  }
];
