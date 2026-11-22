// Borra los productos de prueba (campo demo:true).
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from './_admin.mjs';

initAdmin();
const db = getFirestore();
const snap = await db.collection('products').where('demo', '==', true).get();
for (const d of snap.docs) {
  await db.collection('products_private').doc(d.id).delete();
  await d.ref.delete();
  console.log('🗑', d.data().name);
}
console.log(`\n${snap.size} productos de prueba eliminados.`);
