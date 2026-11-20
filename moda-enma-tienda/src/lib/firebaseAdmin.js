// src/lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

const firebaseAdmin = admin.default || admin;

let appInstance = null;
let dbInstance = null;

try {
  if (firebaseAdmin && firebaseAdmin.apps) {
    if (!firebaseAdmin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountKey) {
        const parsedKey = JSON.parse(serviceAccountKey);
        appInstance = firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(parsedKey),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || parsedKey.project_id
        });
      } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        appInstance = firebaseAdmin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
      }
    } else {
      appInstance = firebaseAdmin.apps[0];
    }

    if (appInstance) {
      dbInstance = firebaseAdmin.firestore(appInstance);
    }
  }
} catch (err) {
  console.warn("Aviso inicializando Firebase Admin SDK:", err.message);
}

export const adminDb = dbInstance;
export default firebaseAdmin;
