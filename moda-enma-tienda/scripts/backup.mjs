// Copia de seguridad de Firestore a backups/AAAA-MM-DD/*.json (haz una antes de cambios grandes).
import { mkdirSync, writeFileSync } from 'node:fs';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from './_admin.mjs';

initAdmin();
const db = getFirestore();
const dir = `backups/${new Date().toISOString().slice(0, 10)}`;
mkdirSync(dir, { recursive: true });
for (const col of ['products', 'products_private', 'orders', 'clients', 'invoices', 'templates', 'tasks', 'stats_daily', 'meta']) {
  const snap = await db.collection(col).get();
  writeFileSync(`${dir}/${col}.json`, JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() })), null, 2));
  console.log(`✔ ${col}: ${snap.size}`);
}
console.log(`\nGuardado en moda-enma-tienda/${dir}`);
