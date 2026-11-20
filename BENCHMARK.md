# BENCHMARK.md — Usabilidad y Patrones de Alta Conversión

**Fecha**: 20 de Noviembre de 2026  
**Referentes analizados**: Zara, Mango, Bershka, Pull&Bear  
**Aplicación a**: ModaEnma (Boutique de Málaga)

---

## 1. Densidad y Retícula
- **Móvil (375px - 430px)**:
  - Estándar de la industria (Zara/Mango): **2 columnas limpias** en cuadrícula de productos con ratio vertical (3:4 o 4:5), margen lateral de 16px y separación mínima (8-12px) entre tarjetas para maximizar el impacto visual de las prendas.
  - En ModaEnma: Adoptamos 2 columnas en móvil y 4 columnas en desktop (lg), respetando aire y legibilidad.
- **Fichas de Producto**:
  - Imágenes en formato carrusel vertical o swipe horizontal con indicador de puntos.
  - Barra inferior de compra **fija** (Sticky Buy Bar) en móvil con selector rápido de talla y botón directo a bolsa.

## 2. Navegación y Menú
- **Header**:
  - Logo centrado, minimalista y con tracking editorial.
  - Iconos esenciales a la derecha: Búsqueda (con overlay inmediato) y Bolsa (con contador numérico).
  - En escritorio: Menú de categorías con revelado suave (Mega Menú con imagen destacada de temporada).
  - En móvil: Menú lateral (Drawer) limpio con tipografía generosa y enlaces institucionales (Sobre la marca, Contacto, Envíos).

## 3. Carrito y Mini-Bolsa (Drawer)
- Al pulsar "Añadir a la bolsa": Apertura lateral automática del Drawer con confirmación háptica/visual sin redirigir al usuario, permitiendo seguir explorando.
- Contador de progreso: "Te faltan X € para disfrutar de envío local gratuito en Málaga" (configurable en `site.config.js`).

## 4. Checkout en Un Solo Paso
- Estructura limpia de 3 bloques consecutivos:
  1. **Contacto**: Teléfono y Email para seguimiento.
  2. **Entrega**: Selección entre Recogida en Boutique o Entrega en mano en Málaga (filtrado por código postal).
  3. **Pago**: Solo los 2 métodos autorizados: **PayPal** y **Pago en mano**.
- Casilla explícita y obligatoria de aceptación de Términos y Condiciones y Política de Privacidad.

## 5. Diferenciación Editorial ModaEnma ("No somos otra tienda clon")
- Frente al monocromatismo y frialdad de las cadenas rápidas, aportamos:
  - Fondo cálido Crema / Arena.
  - Tinte cromático sutil identificador por sección.
  - Visor 3D interactivo en la botella térmica (experiencia táctil moderna).
  - Tono cercano y local: Confección, cercanía y atención directa por WhatsApp.

