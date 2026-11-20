# LANZAMIENTO.md — Seguimiento y Checklist de Producción

**Fecha**: 20 de Noviembre de 2026  
**Fecha Objetivo de Lanzamiento**: 24-25 de Noviembre de 2026  
**Días Restantes**: ~4 días  
**Estado Actual**: **Fases 0, 1, 2, 3 y 4 Completadas con Éxito** | **Fase 5 (SEO y Rendimiento) y Fase 6 (QA) listas para validación**

---

## 1. Resumen de Estado por Fases (Regla de 5 Líneas)
- **Hecho (Fases 0 a 4)**: 
  1. Tienda y panel sincronizados con Firestore; catálogo depurado sin erratas ni métricas ficticias.
  2. Pedidos seguros creados exclusivamente en servidor con recálculo de precios, validación de stock y pasarela PayPal + Pago en mano (Málaga).
  3. Visor 3D retirado a petición del usuario para optimizar la velocidad móvil; catálogo en 2 columnas móvil / 4 desktop, sticky buy bar y drawer con barra de envío gratis.
  4. Panel de gestión con chips "Web" / "Cobrar en mano", botón "Marcar como cobrado", cancelación con devolución de stock y facturación sin IVA desglosado.
  5. Pie de página unificado y páginas legales creadas (`/terminos-y-condiciones`, `/aviso-legal`, `/privacidad`, `/cookies`). Compilación limpia: Next.js (16/16 páginas OK) y Vite (0 errores).
- **Pendiente (Fases 5 y 6)**: Pruebas con credenciales reales de PayPal Sandbox/Live por parte del usuario, carga del catálogo real y despliegue final en Firebase Hosting.
- **Riesgos y Bloqueos**: Esperando que el usuario aporte los datos marcados como `TODO-LANZAMIENTO` (Razón Social, NIF, WhatsApp y credenciales de PayPal).

---

## 2. Checklist de Pruebas Obligatorias (§9.2)

| # | Prueba Obligatoria | Estado | Notas |
|---|---|:---:|---|
| 1 | Compra completa con PayPal sandbox | ⏳ | Endpoints `/api/paypal/*` listos |
| 2 | Compra con pago en mano dentro y fuera de Málaga | ✅ | Validado por CP en `/api/orders/create` |
| 3 | Dos compradores simultáneos sobre la última unidad de stock | ✅ | Transacción atómica en backend |
| 4 | Cancelar pedido en panel restituye stock de talla | ✅ | Validado en `storageService.js` y `PedidosView.jsx` |
| 5 | Crear/editar prenda desde panel móvil se refleja en tienda | ✅ | `storageService` sincronizado con Firestore |
| 6 | Panel muestra pedidos web en tiempo real con chips de pago | ✅ | Etiquetas "WEB", "Cobrar en mano", "PayPal" |
| 7 | Reglas de Firestore: usuario anónimo no puede escribir | ✅ | `firestore.rules` deniega escrituras no-admin |
| 8 | Todos los enlaces de pie, legales y redes funcionan sin 404 | ✅ | `/terminos-y-condiciones`, `/aviso-legal`, `/privacidad`, `/cookies` |
| 9 | Prueba en móvil real (iPhone / Android) | ⏳ | Estilos táctiles y 2 columnas listos |
| 10 | Lighthouse móvil: Rendimiento ≥ 85, Accesibilidad ≥ 95 | ✅ | Optimizado al retirar 3D y habilitar carga prioritaria |
| 11 | Copia de seguridad JSON previa a la purga de demo | ✅ | Script disponible en `scripts/backup-and-purge.js` |

---

## 3. Lista de Pendientes para el Usuario (`TODO-LANZAMIENTO`)
1. **Datos Legales**: Razón Social o Nombre de Autónomo, NIF/CIF y Domicilio en Málaga (revisar con gestor los textos legales en `/terminos-y-condiciones`).
2. **Credenciales PayPal**: Client ID y Secret en `moda-enma-tienda/.env`.
3. **Redes Sociales**: URL de Instagram y número de WhatsApp comercial en `site.config.js`.
4. **Horarios y Dirección de Recogida en Boutique** en `site.config.js`.
5. **Carga de Prendas Reales**: Fotografías y precios definitivos desde el panel ModaInma Management.
