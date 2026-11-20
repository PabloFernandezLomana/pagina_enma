# DESIGN.md — Sistema de Diseño ModaEnma & ModaInma

## 1. Filosofía de Marca: "Boutique Cálida de Málaga"
Frente a las rejillas impersonales y sobredimensionadas de las macrotiendas, ModaEnma respira calma, espacio blanco editorial y luz mediterránea:
- Una sola idea clara por pantalla.
- Tipografía con dignidad y proporción (Cormorant Garamond para titulares; Plus Jakarta Sans para navegación, filtros y datos).
- Fotografía con aire, fondos naturales y ausencia total de gráficos 3D genéricos fuera del producto real.

## 2. Paleta de Color Unificada (`tokens.css`)

### Tienda (ModaEnma)
- **Fondo Base**: Crema suave (`#FAF8F5`) y Arena cálido (`#EAE3D9`).
- **Acento Principal**: Terracota Boutique (`#C85A32` / hover `#A9431E`).
- **Tintes Suaves por Sección** (Contraste verificado WCAG AA con texto `#2D2926`):
  - *Mujer*: Rosa empolvado (`#FDE8EC`)
  - *Hombre*: Azul pizarra suave (`#E8EEF5`)
  - *Niños*: Mantequilla cálida (`#FFF7DF`)
  - *Deporte*: Oliva técnico claro (`#EFF3E6`)
  - *Accesorios*: Terracota albaricoque (`#FBECE5`)

### Panel de Gestión (ModaInma Management)
- **Acentos Pastel**: Rosa pastel (`#F4C2C2`), Oliva boutique (`#B2AC88`), Azul cielo empolvado (`#A2C2E1`).
- **Superficies**: Tarjetas en Crema/Blanco cálido con bordes sutiles `#E5DFD7`.
- **Botones y Acciones**: Formas amables, botones redondeados de tacto amplio (mínimo 44px de área táctil).

## 3. Microinteracciones y Movimiento
- Entradas editoriales discretas (150-300ms) mediante `transform` y `opacity`.
- Respeto riguroso de `prefers-reduced-motion`.
- Cero animaciones decorativas superfluas que entorpezcan el proceso de compra o la agilidad de gestión en el panel.

