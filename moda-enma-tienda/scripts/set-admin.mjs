// Da permisos de administrador a una cuenta del panel.
// Uso:  npm run set-admin -- correo@ejemplo.com     (la cuenta ya debe existir en Firebase Auth)
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from './_admin.mjs';

const email = process.argv[2];
if (!email) { console.error('Uso: npm run set-admin -- correo@ejemplo.com'); process.exit(1); }
initAdmin();
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log(`✔ ${email} ya es administrador. Cierra sesión y vuelve a entrar en el panel.`);
