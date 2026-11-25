// Prueba extremo a extremo con una cuenta admin TEMPORAL (aleatoria, enmascarada y borrada al final).
// No toca ninguna cuenta real ni imprime correos/contraseñas.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { chromium } from 'playwright';
import { randomBytes } from 'node:crypto';

const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID, KEY = process.env.VITE_FIREBASE_API_KEY;
const SITE = 'https://moda-enma.web.app';
initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const auth = getAuth();
const email = `e2e-${randomBytes(5).toString('hex')}@example.com`;
const pass = `Tmp-${randomBytes(9).toString('hex')}`;
console.log(`::add-mask::${pass}`); console.log(`::add-mask::${email}`);
const out = {};
let uid;
try {
  const all = []; let pt; do { const r = await auth.listUsers(1000, pt); all.push(...r.users); pt = r.pageToken; } while (pt);
  out.usuariosReales = all.length;
  const u = await auth.createUser({ email, password: pass, emailVerified: false });
  uid = u.uid; await auth.setCustomUserClaims(uid, { admin: true });

  // 1) Inicio de sesión real contra Firebase Auth (como hace el panel)
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass, returnSecureToken: true }) });
  const j = await r.json(); out.signInHttp = r.status;
  if (!r.ok) throw new Error('signInWithPassword: ' + j.error?.message);
  const claims = JSON.parse(Buffer.from(j.idToken.split('.')[1], 'base64url').toString());
  out.idTokenAdmin = claims.admin; out.proveedor = claims.firebase?.sign_in_provider;

  // 2) Firestore con ese idToken de sesión (reglas reales)
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const H = { Authorization: `Bearer ${j.idToken}`, 'Content-Type': 'application/json' };
  const rd = async (c, h) => (await fetch(`${base}/${c}?pageSize=1`, { headers: h })).status;
  for (const c of ['products', 'orders', 'clients', 'invoices', 'settings', 'meta', 'stats_daily']) out[`leer ${c}`] = await rd(c, H);
  out['orders sin sesión'] = await rd('orders', {});
  const id = 'zz-e2e-' + Date.now();
  out.crear = (await fetch(`${base}/products?documentId=${id}`, { method: 'POST', headers: H, body: JSON.stringify({ fields: { name: { stringValue: 'e2e' }, salePrice: { integerValue: '1' }, active: { booleanValue: false }, variants: { arrayValue: { values: [] } } } }) })).status;
  out.borrar = (await fetch(`${base}/products/${id}`, { method: 'DELETE', headers: H })).status;

  // 3) Login real en el panel desplegado, con navegador
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  pg.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push('console:' + m.text().slice(0, 160)); });
  pg.on('requestfailed', (r) => errs.push('reqfail:' + r.url().split('?')[0].slice(0, 90) + ' ' + (r.failure()?.errorText || '')));
  pg.on('response', (r) => { if (/identitytoolkit|securetoken|firestore/.test(r.url())) out['net ' + r.url().split('?')[0].split('/').slice(-1)[0] + ' ' + r.request().method()] = r.status(); });
  await pg.goto(SITE, { waitUntil: 'networkidle' });
  out.titulo = await pg.title();
  await pg.fill('input[type=email]', ' ' + email.toUpperCase() + ' '); // con espacios y mayúsculas, como desde el móvil
  await pg.fill('input[type=password]', pass);
  await pg.click('button:has-text("Entrar")');
  const result = await Promise.race([
    pg.waitForSelector('nav.tabbar, aside.sidebar', { timeout: 20000 }).then(() => 'panel'),
    pg.waitForSelector('text=aún no tiene acceso', { timeout: 20000 }).then(() => 'sin-permiso'),
    pg.waitForSelector('.Toastify, [data-sonner-toast]', { timeout: 20000 }).then(async () => 'error: ' + (await pg.locator('[data-sonner-toast]').first().innerText().catch(() => '?'))),
  ]).catch(() => 'timeout');
  out.loginWeb = result;
  if (result === 'timeout') { out.textoPantalla = (await pg.locator('body').innerText()).replace(email, '<email>').slice(0, 400); out.url = pg.url(); }
  if (result === 'panel') {
    await pg.waitForFunction(() => !document.body.innerText.includes('Cargando tu tienda'), null, { timeout: 20000 }).catch(() => {});
    out.cargaDatos = (await pg.locator('main').innerText()).includes('Cargando') ? 'sigue cargando' : 'ok';
    out.avisoPermisos = (await pg.locator('main').innerText()).includes('no tiene permiso') ? 'SÍ (mal)' : 'no';
  }
  out.erroresJS = errs;
  await b.close();
} catch (e) { out.FALLO = String(e.message || e).slice(0, 300); process.exitCode = 1; }
finally { if (uid) { await auth.deleteUser(uid).then(() => { out.cuentaTemporalBorrada = true; }).catch(() => { out.cuentaTemporalBorrada = 'NO'; }); } console.log(JSON.stringify(out, null, 2)); }
