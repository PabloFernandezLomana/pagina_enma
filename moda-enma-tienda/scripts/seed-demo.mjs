// Carga los productos de PRUEBA en Firestore (con sus fotos en Storage).
// Uso:  npm run seed-demo      ·  Para quitarlos: npm run purge-demo  (o bórralos desde el panel)
import { readFileSync } from 'node:fs';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initAdmin } from './_admin.mjs';
import { DEMO_PRODUCTS } from '../src/data/demoProducts.js';

initAdmin();
const db = getFirestore();
const bucket = getStorage().bucket();
const cache = new Map();

async function upload(localPath) {
  if (cache.has(localPath)) return cache.get(localPath);
  const dest = `products/demo/${localPath.split('/').pop()}`;
  await bucket.file(dest).save(readFileSync(`public${localPath}`), { contentType: 'image/webp', resumable: false });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media`;
  cache.set(localPath, url);
  return url;
}

for (const { costPrice, ...p } of DEMO_PRODUCTS) {
  const images = await Promise.all(p.images.map(upload));
  await db.collection('products').doc(p.id).set({ ...p, images });
  await db.collection('products_private').doc(p.id).set({ costPrice });
  console.log('✔', p.name);
}
console.log(`\n${DEMO_PRODUCTS.length} productos de prueba cargados. Bórralos cuando tengas los reales.`);
