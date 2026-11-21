// Inicializa Firebase Admin para los scripts. Necesita FIREBASE_SERVICE_ACCOUNT_KEY
// (JSON o base64) en el entorno, o la variable GOOGLE_APPLICATION_CREDENTIALS.
import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';

function loadEnvFile() {
  for (const f of ['.env.local', '.env']) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

export function initAdmin() {
  loadEnvFile();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (raw) {
    const key = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
    return initializeApp({ credential: cert(key), projectId: key.project_id, storageBucket: bucket });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault(), storageBucket: bucket });
  }
  console.error('✖ Falta FIREBASE_SERVICE_ACCOUNT_KEY en moda-enma-tienda/.env.local (ver README).');
  process.exit(1);
}
