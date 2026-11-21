# Panel de gestión ModaEnma (React + Vite)

- Datos en tiempo real desde Firestore (mismo proyecto que la tienda).
- Subida de fotos a Firebase Storage (se comprimen en el navegador).
- Modo prueba sin Firebase: `VITE_DEMO=1 npm run dev` (datos de ejemplo en el navegador, nunca en producción).

```bash
npm install
cp .env.example .env     # rellena las claves de Firebase
npm run dev
npm run build            # genera dist/ para Firebase Hosting
```

La cuenta que entra debe ser administradora: `npm run set-admin -- correo@ejemplo.com` (en `moda-enma-tienda/`). Guía completa: `../LANZAMIENTO.md`.
