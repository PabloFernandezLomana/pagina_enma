// pagina_inma/src/lib/backend.js
// Capa de datos única. Dos implementaciones con la misma interfaz:
//  - firebaseBackend: Firestore en tiempo real + fotos en Cloudinary (producción, sin tarjeta)
//  - demoBackend: localStorage (solo si VITE_DEMO=1, para probar sin Firebase)
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, runTransaction,
} from 'firebase/firestore';
import { DEMO_SEED } from './demoSeed';

const env = import.meta.env;
export const IS_DEMO = env.VITE_DEMO === '1';

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && !String(firebaseConfig.apiKey).startsWith('TODO'));

/** Firestore no admite `undefined`. */
export function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}

/* ------------------------------ Firebase ------------------------------ */
function makeFirebaseBackend() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return {
    mode: 'firebase',
    auth: {
      onChange(cb) {
        return onAuthStateChanged(auth, async (user) => {
          if (!user) return cb(null);
          const token = await user.getIdTokenResult(true);
          cb({ email: user.email, uid: user.uid, isAdmin: token.claims.admin === true || token.claims.role === 'admin' });
        });
      },
      signIn: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
      signOut: () => signOut(auth),
      reset: (email) => sendPasswordResetEmail(auth, email),
    },
    subscribe(col, cb) {
      return onSnapshot(collection(db, col), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (err) => {
        console.warn(`[${col}]`, err.code);
        cb(null, err);
      });
    },
    set: (col, id, data, merge = false) => setDoc(doc(db, col, id), clean(data), { merge }),
    del: (col, id) => deleteDoc(doc(db, col, id)),
    async batch(ops) {
      const b = writeBatch(db);
      for (const [type, col, id, data, merge] of ops) {
        if (type === 'del') b.delete(doc(db, col, id));
        else b.set(doc(db, col, id), clean(data), { merge: Boolean(merge) });
      }
      await b.commit();
    },
    transact: (fn) =>
      runTransaction(db, (t) =>
        fn({
          get: async (col, id) => {
            const s = await t.get(doc(db, col, id));
            return s.exists() ? { id: s.id, ...s.data() } : null;
          },
          set: (col, id, data, merge = false) => t.set(doc(db, col, id), clean(data), { merge }),
        })
      ),
    async upload(blob) {
      const cloud = env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloud || !preset) throw new Error('Faltan los datos de Cloudinary (VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET).');
      const form = new FormData();
      form.append('file', blob);
      form.append('upload_preset', preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.secure_url) throw new Error(json.error?.message || `No se pudo subir la foto (${res.status}).`);
      return json.secure_url;
    },
  };
}

/* -------------------------------- Demo -------------------------------- */
function makeDemoBackend() {
  const KEY = 'modaenma_demo_v1';
  const load = () => {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch { /* vacío */ }
    return structuredClone(DEMO_SEED());
  };
  let state = load();
  const listeners = new Map();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* cuota */ } };
  const emit = (col) => (listeners.get(col) || []).forEach((cb) => cb(Object.entries(state[col] || {}).map(([id, d]) => ({ id, ...d }))));
  const write = (col, id, data, merge) => {
    state[col] = state[col] || {};
    state[col][id] = merge ? { ...(state[col][id] || {}), ...structuredClone(clean(data)) } : structuredClone(clean(data));
    delete state[col][id].id;
  };
  let authCb = null;

  return {
    mode: 'demo',
    auth: {
      onChange(cb) { authCb = cb; setTimeout(() => cb({ email: 'demo@modaenma.local', uid: 'demo', isAdmin: true }), 0); return () => {}; },
      signIn: async () => authCb?.({ email: 'demo@modaenma.local', uid: 'demo', isAdmin: true }),
      signOut: async () => {},
      reset: async () => {},
    },
    subscribe(col, cb) {
      listeners.set(col, [...(listeners.get(col) || []), cb]);
      setTimeout(() => emit(col), 0);
      return () => listeners.set(col, (listeners.get(col) || []).filter((x) => x !== cb));
    },
    async set(col, id, data, merge = false) { write(col, id, data, merge); persist(); emit(col); },
    async del(col, id) { delete state[col]?.[id]; persist(); emit(col); },
    async batch(ops) {
      const cols = new Set();
      for (const [type, col, id, data, merge] of ops) {
        if (type === 'del') delete state[col]?.[id]; else write(col, id, data, merge);
        cols.add(col);
      }
      persist(); cols.forEach(emit);
    },
    async transact(fn) {
      const draft = structuredClone(state);
      const touched = new Set();
      const result = await fn({
        get: async (col, id) => (draft[col]?.[id] ? { id, ...structuredClone(draft[col][id]) } : null),
        set: (col, id, data, merge = false) => {
          draft[col] = draft[col] || {};
          draft[col][id] = merge ? { ...(draft[col][id] || {}), ...structuredClone(clean(data)) } : structuredClone(clean(data));
          delete draft[col][id].id;
          touched.add(col);
        },
      });
      state = draft; persist(); touched.forEach(emit);
      return result;
    },
    async upload(blob) {
      return new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
    },
    reset() { localStorage.removeItem(KEY); state = structuredClone(DEMO_SEED()); Object.keys(state).forEach(emit); },
  };
}

let instance;
export function getBackend() {
  if (instance) return instance;
  if (IS_DEMO) instance = makeDemoBackend();
  else if (isFirebaseConfigured) instance = makeFirebaseBackend();
  else instance = null;
  return instance;
}
