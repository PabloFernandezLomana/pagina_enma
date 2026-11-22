// moda-enma-tienda/src/lib/firebase.client.js
// Firebase en el navegador: SOLO lectura pública del catálogo (para stock en tiempo real).
// Se carga con import() dinámico: así NO entra en el servidor (Cloudflare) y solo se descarga en el navegador.
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const clientConfigured = Boolean(cfg.apiKey && cfg.projectId);

let promise = null;
/** Devuelve { db, fs } (fs = módulo firebase/firestore) o null si no está configurado. Solo en navegador. */
export function getClientFirestore() {
  if (typeof window === 'undefined' || !clientConfigured) return Promise.resolve(null);
  if (!promise) {
    promise = Promise.all([import('firebase/app'), import('firebase/firestore')]).then(([app, fs]) => ({
      db: fs.getFirestore(app.getApps().length ? app.getApp() : app.initializeApp(cfg)),
      fs,
    }));
  }
  return promise;
}
