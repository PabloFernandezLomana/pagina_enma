// Diagnóstico + reparación + verificación del acceso admin. NO imprime correos ni UIDs (el repo es público).
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const TARGET = 'lgodinoherrera@gmail.com';
const REFERENCE = 'pablo.lomana.h@gmail.com';
const API_KEY = process.env.VITE_FIREBASE_API_KEY;
const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID || 'moda-enma';
const log = (...a) => console.log(...a);

initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const auth = getAuth();

const describe = (u) => ({
  exists: true, disabled: u.disabled, emailVerified: u.emailVerified,
  providers: u.providerData.map((p) => p.providerId), hasPassword: u.providerData.some((p) => p.providerId === 'password'),
  claims: u.customClaims || {}, everSignedIn: Boolean(u.metadata.lastSignInTime),
});
const lookup = async (email) => { try { return await auth.getUserByEmail(email); } catch (e) { if (e.code === 'auth/user-not-found') return null; throw e; } };

const lev = (a, b) => { const m = [...Array(a.length + 1)].map((_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i-1][j]+1, m[i][j-1]+1, m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return m[a.length][b.length]; };

let step = 'inicio';
try {
  step = 'listar usuarios';
  const all = []; let page; do { const r = await auth.listUsers(1000, page); all.push(...r.users); page = r.pageToken; } while (page);
  log('Usuarios en Auth:', all.length);
  const near = all.filter((u) => u.email && u.email.toLowerCase() !== TARGET && (lev(u.email.toLowerCase(), TARGET) <= 3 || /godino/i.test(u.email)));
  log('Cuentas con email parecido (posible errata/duplicado):', near.length, near.map((u) => ({ disabled: u.disabled, claims: Object.keys(u.customClaims || {}) })));

  step = 'usuario objetivo';
  let t = await lookup(TARGET);
  const ref = await lookup(REFERENCE);
  log('REFERENCIA (pablo):', ref ? describe(ref) : 'NO EXISTE');
  if (!t) { log('OBJETIVO: NO EXISTE en Auth con ese correo exacto'); process.exitCode = 2; throw new Error('objetivo no existe'); }
  log('OBJETIVO antes:', describe(t));

  step = 'reparación';
  const fixes = [];
  if (t.customClaims?.admin !== true) { await auth.setCustomUserClaims(t.uid, { ...(t.customClaims || {}), admin: true }); fixes.push('claim admin=true'); }
  if (t.disabled) { await auth.updateUser(t.uid, { disabled: false }); fixes.push('cuenta reactivada'); }
  log('Reparaciones aplicadas:', fixes.length ? fixes : 'ninguna (ya estaba bien)');
  t = await auth.getUser(t.uid);
  log('OBJETIVO después:', describe(t));

  step = 'verificación con token real';
  const custom = await auth.createCustomToken(t.uid);
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: custom, returnSecureToken: true }) });
  const j = await r.json();
  if (!r.ok) throw new Error('signInWithCustomToken: ' + (j.error?.message || r.status));
  const claims = JSON.parse(Buffer.from(j.idToken.split('.')[1], 'base64url').toString());
  log('ID token: admin =', claims.admin, '| firebase.sign_in_provider =', claims.firebase?.sign_in_provider, '| uid coincide =', claims.user_id === t.uid, '| email coincide =', claims.email === TARGET);
  if (claims.admin !== true) throw new Error('El ID token NO lleva admin=true');

  step = 'reglas de Firestore';
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const H = { Authorization: `Bearer ${j.idToken}`, 'Content-Type': 'application/json' };
  const rd = async (col, headers) => (await fetch(`${base}/${col}?pageSize=1`, { headers })).status;
  const res = {};
  for (const col of ['orders', 'clients', 'products_private', 'settings', 'meta']) res[`leer ${col} (admin)`] = await rd(col, H);
  res['leer orders SIN sesión (debe ser 403)'] = await rd('orders', {});
  const id = 'zz-authcheck-' + Date.now();
  const body = { fields: { name: { stringValue: 'authcheck' }, salePrice: { integerValue: '1' }, active: { booleanValue: false }, variants: { arrayValue: { values: [] } } } };
  res['crear producto (admin)'] = (await fetch(`${base}/products?documentId=${id}`, { method: 'POST', headers: H, body: JSON.stringify(body) })).status;
  res['borrar producto (admin)'] = (await fetch(`${base}/products/${id}`, { method: 'DELETE', headers: H })).status;
  log('Resultados HTTP de Firestore:', res);
  const okAdmin = Object.entries(res).filter(([k]) => k.includes('(admin)')).every(([, v]) => v === 200);
  const okDeny = res['leer orders SIN sesión (debe ser 403)'] === 403;
  log(okAdmin && okDeny ? 'VERIFICACIÓN OK: el usuario pasa las reglas y el anónimo queda bloqueado' : 'VERIFICACIÓN FALLIDA');
  if (!(okAdmin && okDeny)) process.exitCode = 3;
} catch (e) {
  log(`FALLO en "${step}":`, e.code || '', String(e.message || e).slice(0, 300));
  process.exitCode ||= 1;
}
