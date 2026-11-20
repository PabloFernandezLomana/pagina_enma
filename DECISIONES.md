# DECISIONES.md — Registro de Decisiones de Arquitectura y Negocio

**Fecha**: 20 de Noviembre de 2026  
**Lanzamiento Previsto**: 24-25 de Noviembre de 2026

---

### Decisión 1: Sincronización Firestore Unificada vs. LocalStorage
- **Contexto**: El panel (`pagina_inma`) no reflejaba los cambios en la tienda (`moda-enma-tienda`) porque solo escribía en `localStorage`.
- **Decisión**: Conectar `storageService.js` para que cada llamada a `saveProduct`, `deleteProduct`, `saveOrder` y `saveClient` realice la escritura directa sobre Firestore (`products`, `orders`, `clients`) manteniendo `localStorage` como capa reactiva inmediata de fallback sin latencia.

### Decisión 2: Supresión de Objetos 3D Abstractos en el Hero
- **Contexto**: El cono/cilindro dentro del aro en el hero restaba credibilidad comercial e introducía jerga técnica ajena a una boutique de moda.
- **Decisión**: Sustituir el canvas 3D del hero por una fotografía editorial a pantalla completa en formato vertical de alta resolución con carga prioritaria (`priority`), reservando la tecnología 3D exclusivamente para la pieza física icónica (Botella Térmica en `/producto/prod-enma-07` y su sección dedicada con carga diferida).

### Decisión 3: Métricas Verdaderas y Ámbito Local
- **Contexto**: La tienda mostraba claims ilegales o no contrastados en la UE ("5★", "100% stock real sincronizado", "envíos 24/48h a toda España").
- **Decisión**: Eliminar todas las valoraciones ficticias. Reemplazarlas por garantías de negocio reales: "Málaga: entrega local y recogida en tienda", "14 días de devolución garantizada", "Pago cómodo y seguro: Pago en mano o PayPal".

### Decisión 4: Hosting y Despliegue
- **Contexto**: Vercel Hobby no permite tiendas comerciales.
- **Decisión**: Recomendación de **Firebase App Hosting** (Next.js SSR/ISR con plan Blaze de pago por uso) para la tienda y **Firebase Hosting** (Vite SPA estático) para el panel de administración.

### Decisión 5: Supresión del Visor 3D de la Botella
- **Contexto**: El usuario solicitó explícitamente prescindir del visor 3D al no considerarlo necesario para el modelo de boutique de ropa y accesorios.
- **Decisión**: Eliminar el bloque `ProductViewer3D` de la Home y de la ficha de la botella. Sustituir por fotografía editorial detallada en alta resolución, eliminando la sobrecarga de peso de Three.js / Canvas en el cliente para acelerar el tiempo de carga y maximizar las métricas Web Vitals en dispositivos móviles.

