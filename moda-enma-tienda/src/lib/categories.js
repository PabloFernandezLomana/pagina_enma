// moda-enma-tienda/src/lib/categories.js
// Taxonomía compartida con el panel: department (sección de la tienda) + category (tipo de prenda).

export const DEPARTMENTS = [
  { id: 'mujer', name: 'Mujer', tint: 'mujer', desc: 'Vestidos, blusas y conjuntos para el día a día.' },
  { id: 'hombre', name: 'Hombre', tint: 'hombre', desc: 'Básicos con buen corte y mucho uso.' },
  { id: 'ninos', name: 'Niños', tint: 'ninos', desc: 'Cómodo, resistente y con color.' },
  { id: 'deporte', name: 'Deporte', tint: 'deporte', desc: 'Camisetas, mallas y equipación para moverte.' },
  { id: 'accesorios', name: 'Accesorios', tint: 'accesorios', desc: 'Botellas de acero, bolsos y pequeños detalles.' },
];

export const PRODUCT_TYPES = [
  'Vestidos', 'Blusas', 'Camisas', 'Pantalones', 'Chaquetas', 'Faldas',
  'Camisetas y tops', 'Sudaderas', 'Conjuntos', 'Accesorios', 'Otros',
];

export const SIZE_PRESETS = {
  ropa: ['XS', 'S', 'M', 'L', 'XL'],
  nino: ['4', '6', '8', '10', '12'],
  unica: ['Única'],
};

export const getDepartment = (id) => DEPARTMENTS.find((d) => d.id === id) || null;
