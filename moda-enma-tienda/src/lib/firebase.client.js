// moda-enma-tienda/src/lib/firebase.client.js
// Firebase en el navegador: SOLO lectura pública del catálogo (para stock en tiempo real).
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const clientConfigured = Boolean(cfg.apiKey && cfg.projectId);

let db = null;
export function getClientDb() {
  if (!clientConfigured) return null;
  if (!db) db = getFirestore(getApps().length ? getApp() : initializeApp(cfg));
  return db;
}
