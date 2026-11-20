# 🌸 ModaInma Management Web App

**ModaInma Management** es una aplicación web progresiva (PWA) de gestión comercial para boutiques de moda: catálogo con control de stock por tallas y fotos múltiples, gestión CRM de clientes, embudo de pedidos, emisión de facturas oficiales y plantillas de WhatsApp.

---

## 🌟 Novedades y Funcionalidades Principales

1. **Precios de Compra vs Venta:** Cálculo en tiempo real de beneficios (€) y % de margen por prenda.
2. **Facturación Directa:** Facturas sin desglose de IVA (mostrando el PVP final del producto/pedido).
3. **Modales Interactivos Adaptables:** Modales con scroll inteligente en `modal-body` y botones fijos (*sticky header/footer*).
4. **Descuento Automático de Stock:** Descuento automático por talla al vender y devolución automática al cancelar o eliminar pedidos.
5. **Talla Única & Nuevas Categorías:** Soporte para prendas de Talla Única y nuevas categorías `"Conjuntos"` y `"Otros"`.
6. **Múltiples Imágenes y Compresión:** Carga de varias fotos por producto, compresión automática en canvas y mini-galería interactiva.
7. **Agenda Telefónica Móvil:** Integración con la `Contact Picker API` (`navigator.contacts.select`) para importar clientes desde la agenda del smartphone.
8. **Nube Firebase & Autenticación:** Soporte para Firebase Auth, Cloud Firestore y Firebase Storage en tiempo real, con fallback a LocalStorage.

---

## 🚀 Despliegue en Firebase Hosting (Paso a Paso)

Sigue estos sencillos pasos para publicar tu aplicación en la nube y acceder a ella desde cualquier dispositivo (móvil, tablet u otro ordenador):

### Paso 1: Crear el proyecto en la Consola de Firebase
1. Entra en [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** y nómbralo `modainma-app` (o el nombre que prefieras).
3. En el menú lateral, activa los 3 servicios:
   - **Authentication:** Haz clic en *Comenzar*, selecciona el método **Correo electrónico/Contraseña** y habilítalo. Crea tu cuenta de administradora (ej. `admin@modainma.com`).
   - **Cloud Firestore:** Haz clic en *Crear base de datos*, elige ubicación (ej. `europe-west3`) y selecciona *Modo de prueba* o aplica las reglas de [DOCUMENTACION_ECOMMERCE.md](DOCUMENTACION_ECOMMERCE.md).
   - **Storage:** Haz clic en *Comenzar* en Cloud Storage y acepta las reglas predeterminadas.

### Paso 2: Crear el archivo de configuración `.env`
En la raíz del proyecto `pagina_inma/`, crea un archivo llamado `.env` con las credenciales que Firebase te proporciona en *Configuración del proyecto > Aplicaciones web*:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=modainma-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=modainma-app
VITE_FIREBASE_STORAGE_BUCKET=modainma-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### Paso 3: Instalar Firebase CLI y desplegar
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Instalar Firebase CLI de forma global (si no lo tienes)
npm install -g firebase-tools

# 2. Iniciar sesión en tu cuenta de Google
firebase login

# 3. Inicializar Hosting en el proyecto
firebase init hosting
```
- Cuando pida seleccionar el proyecto, elige **Use an existing project** y selecciona `modainma-app`.
- Cuando pida el directorio público (*What do you want to use as your public directory?*), escribe: **`dist`**
- Cuando pregunte *Configure as a single-page app (rewrite all urls to /index.html)?*, responde: **`y`** (Sí)
- Cuando pregunte *Set up automatic builds and deploys with GitHub?*, responde: **`N`** (No)

### Paso 4: Compilar y Publicar
Finalmente, ejecuta los dos comandos de compilación y despliegue:

```bash
# Compilar la aplicación para producción
npm run build

# Publicar en Firebase Hosting
firebase deploy --only hosting
```

Al terminar, Firebase te entregará la **URL pública fija** (ejemplo: `https://modainma-app.web.app`) con certificado SSL seguro (HTTPS) lista para usar en cualquier móvil u ordenador.

---

## 🛠️ Comandos de Desarrollo Local

```bash
# Servidor local de desarrollo
npm run dev

# Verificación de sintaxis con Oxlint
npm run lint

# Previsualizar build de producción
npm run preview
```

---
*Para detalles de arquitectura e-commerce futura, consulta [DOCUMENTACION_ECOMMERCE.md](DOCUMENTACION_ECOMMERCE.md).*
