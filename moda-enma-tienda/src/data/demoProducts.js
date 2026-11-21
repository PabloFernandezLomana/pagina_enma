// moda-enma-tienda/src/data/demoProducts.js
// Catálogo de PRUEBA con ilustraciones propias (public/demo). No se usa en producción
// salvo que pongas ALLOW_DEMO_CATALOG=true. Se puede cargar a Firestore con `npm run seed-demo`
// y borrar desde el panel (o con `npm run purge-demo`).

const v = (sizes, stocks) => sizes.map((size, i) => ({ size, stock: stocks[i] ?? 0 }));
const ropa = ['XS', 'S', 'M', 'L', 'XL'];
const nino = ['4', '6', '8', '10', '12'];
const now = '2026-11-20T10:00:00.000Z';

export const DEMO_PRODUCTS = [
  { id: 'demo-vestido-lino', name: 'Vestido midi de lino', department: 'mujer', category: 'Vestidos', sku: 'DEMO-VES-01', salePrice: 49.9, costPrice: 21, description: 'Vestido midi de lino lavado con cintura marcada y falda con vuelo. Fresco, ligero y fácil de combinar.', images: ['/demo/vestido-lino.webp'], variants: v(ropa, [2, 4, 5, 3, 1]), tag: 'Novedad', featured: true },
  { id: 'demo-blusa-satin', name: 'Blusa de satén', department: 'mujer', category: 'Blusas', sku: 'DEMO-BLU-01', salePrice: 29.9, costPrice: 11, description: 'Blusa fluida de satén con cuello lazada. Para la oficina o para una cena.', images: ['/demo/blusa-satin.webp'], variants: v(ropa, [3, 5, 4, 2, 0]), featured: true },
  { id: 'demo-conjunto-punto', name: 'Conjunto de punto', department: 'mujer', category: 'Conjuntos', sku: 'DEMO-CON-01', salePrice: 54.9, costPrice: 24, description: 'Jersey y falda de punto suave en el mismo tono. Dos piezas, mil looks.', images: ['/demo/conjunto-punto.webp'], variants: v(ropa, [1, 3, 3, 2, 1]), tag: 'Últimas unidades' },
  { id: 'demo-camisa-lino', name: 'Camisa de lino', department: 'hombre', category: 'Camisas', sku: 'DEMO-CAM-01', salePrice: 39.9, costPrice: 16, description: 'Camisa de lino de manga larga, corte regular. Mejora con cada lavado.', images: ['/demo/camisa-lino.webp'], variants: v(['S', 'M', 'L', 'XL', 'XXL'], [2, 5, 6, 3, 1]), featured: true },
  { id: 'demo-pantalon-chino', name: 'Pantalón chino', department: 'hombre', category: 'Pantalones', sku: 'DEMO-PAN-01', salePrice: 44.9, costPrice: 19, description: 'Chino de algodón elástico con pierna recta. El básico que siempre acabas poniéndote.', images: ['/demo/pantalon-chino.webp'], variants: v(['38', '40', '42', '44', '46'], [2, 4, 4, 3, 2]) },
  { id: 'demo-sudadera', name: 'Sudadera con capucha', department: 'hombre', category: 'Sudaderas', sku: 'DEMO-SUD-01', salePrice: 42.9, costPrice: 18, description: 'Sudadera de felpa gruesa con capucha y bolsillo canguro.', images: ['/demo/sudadera.webp'], variants: v(['S', 'M', 'L', 'XL', 'XXL'], [3, 6, 5, 4, 2]), tag: 'Novedad' },
  { id: 'demo-camiseta-nino', name: 'Camiseta estampada niño', department: 'ninos', category: 'Camisetas y tops', sku: 'DEMO-NIN-01', salePrice: 14.9, costPrice: 5, description: 'Camiseta de algodón suave con estampado divertido. Aguanta recreos y lavadoras.', images: ['/demo/camiseta-nino.webp'], variants: v(nino, [4, 6, 6, 4, 2]) },
  { id: 'demo-conjunto-nino', name: 'Conjunto chándal niño', department: 'ninos', category: 'Conjuntos', sku: 'DEMO-NIN-02', salePrice: 29.9, costPrice: 12, description: 'Sudadera y pantalón de felpa, cómodo para jugar todo el día.', images: ['/demo/conjunto-nino.webp'], variants: v(nino, [2, 3, 4, 3, 1]) },
  { id: 'demo-camiseta-futbol', name: 'Camiseta de fútbol', department: 'deporte', category: 'Camisetas y tops', sku: 'DEMO-DEP-01', salePrice: 34.9, costPrice: 14, description: 'Camiseta técnica transpirable con cuello en V. Seca rápido.', images: ['/demo/camiseta-futbol.webp'], variants: v(['S', 'M', 'L', 'XL', 'XXL'], [4, 6, 6, 3, 2]), tag: 'Novedad', featured: true },
  { id: 'demo-mallas', name: 'Mallas deportivas', department: 'deporte', category: 'Pantalones', sku: 'DEMO-DEP-02', salePrice: 27.9, costPrice: 10, description: 'Mallas de tiro alto con tejido elástico que no transparenta.', images: ['/demo/mallas.webp'], variants: v(ropa, [3, 5, 5, 3, 0]) },
  { id: 'demo-botella-acero', name: 'Botella de acero 750 ml', department: 'accesorios', category: 'Accesorios', sku: 'DEMO-ACC-01', salePrice: 19.9, costPrice: 7, description: 'Botella de acero inoxidable con doble pared. Mantiene el frío 24 h y el calor 12 h.', images: ['/demo/botella-acero.webp'], variants: v(['Única'], [12]), tag: 'Más vendido', featured: true },
  { id: 'demo-bolso-tote', name: 'Bolso tote de algodón', department: 'accesorios', category: 'Accesorios', sku: 'DEMO-ACC-02', salePrice: 16.9, costPrice: 5.5, description: 'Tote de algodón grueso con asas largas. Cabe todo y pesa nada.', images: ['/demo/bolso-tote.webp'], variants: v(['Única'], [8]) },
].map((p) => ({ ...p, active: true, demo: true, lowStockThreshold: 3, createdAt: now, updatedAt: now }));
