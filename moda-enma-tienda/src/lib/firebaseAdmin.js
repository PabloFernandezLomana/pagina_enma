// moda-enma-tienda/src/lib/firebaseAdmin.js
// Firebase Admin SOLO en servidor. En Firebase App Hosting usa credenciales automáticas;
// en local usa FIREBASE_SERVICE_ACCOUNT_KEY (JSON o JSON en base64).
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let db = null;
let initError = null;
let tried = false;

function parseKey(raw) {
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(text);
}

function init() {
  if (tried) return;
  tried = true;
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    let app = getApps()[0];
    if (!app) {
      if (raw) {
        const key = parseKey(raw);
        app = initializeApp({ credential: cert(key), projectId: key.project_id });
      } else if (process.env.FIREBASE_CONFIG || process.env.GOOGLE_CLOUD_PROJECT || process.env.K_SERVICE) {
        app = initializeApp({ credential: applicationDefault() });
      } else {
        return; // sin credenciales: modo sin base de datos (solo demo en desarrollo)
      }
    }
    db = getFirestore(app);
  } catch (err) {
    initError = err;
    console.error('[firebaseAdmin] No se pudo iniciar:', err.message);
  }
}

export function getAdminDb() {
  init();
  return db;
}
export const getAdminError = () => initError;
export { FieldValue };

/** El catálogo de demostración solo se permite en desarrollo o si lo activas a propósito. */
export function isDemoAllowed() {
  const flag = process.env.ALLOW_DEMO_CATALOG;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
