# PRODUCT.md — ModaEnma (Tienda) & ModaInma Management (Panel)

## 1. Visión y Propósito
ModaEnma es una boutique online con arraigo en Málaga orientada a ofrecer una experiencia editorial, cuidada y humana. Se aleja deliberadamente de la frialdad monocromática e industrial de grandes cadenas (Zara, Bershka, Pull&Bear) para proyectar calidez, selección artesanal y cercanía local.

ModaInma Management es la herramienta privada que permite gestionar el negocio íntegro en tiempo real de manera visual y sin conocimientos técnicos, desde el teléfono móvil o el ordenador.

## 2. Usuarios y Personas
- **El Comprador / Cliente de la Boutique**:
  - Busca prendas para el día a día o momentos especiales con corte favorecedor y personalidad.
  - Valora la claridad, la ausencia de artificios y la comodidad de comprar online con pago en mano o PayPal.
  - Con base en Málaga capital y alrededores.
- **La Gestora / Dueña de la Boutique**:
  - Persona no técnica con alta dedicación al trato con el cliente y selección de producto.
  - Requiere un panel inmediato: fotografiar prendas desde el móvil, actualizar el stock por talla, atender pedidos y comunicarse por WhatsApp con un solo clic.

## 3. Arquitectura del Producto
- **Tienda Pública (`moda-enma-tienda`)**:
  - Framework: Next.js (App Router, Tailwind CSS, GSAP).
  - Enfoque: Rendimiento LCP ultrarrápido, fotografía editorial, tintes sutiles por categoría, experiencia de compra en un solo paso y visor 3D interactivo para producto estrella (botella térmica).
- **Panel de Control (`pagina_inma`)**:
  - Framework: React 19 + Vite.
  - Diseño: Stitch Design System (Rosa pastel, oliva, azul pastel, neutro cálido, tarjetas redondeadas).
  - Capacidades: Catálogo con matriz de tallas, pipeline Kanban de pedidos con WhatsApp por estado, CRM de clientes y facturación sin IVA visible por defecto.

## 4. Canales y Operativa de Pago
- **PayPal**: Pago digital seguro con verificación de stock y captura server-side.
- **Pago en Mano**: Reservado para códigos postales de Málaga, con reserva automática de stock y cobro al entregar o recoger en tienda.

