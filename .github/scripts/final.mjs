// Reparación + verificación del segundo admin. La contraseña viaja CIFRADA (box.json) y nunca se imprime.
import { readFileSync } from 'node:fs';
import { hkdfSync, createPrivateKey, createPublicKey, diffieHellman, createDecipheriv, generateKeyPairSync, createCipheriv, randomBytes } from 'node:crypto';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { chromium } from 'playwright';

const TARGET = 'lgodinoherrera@gmail.com';
const MYPUB = '2800969b0dda5611c6100385f4d567223221d2d04dd914c0e6d432b83489e05a';
const SPKI = Buffer.from('302a300506032b656e032100', 'hex');
const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID, KEY = process.env.VITE_FIREBASE_API_KEY;
const sa = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
const seed = Buffer.from(hkdfSync('sha256', sa.private_key, 'moda-enma', 'transport-v1', 32));
const myPriv = createPrivateKey({ key: Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), seed]), format: 'der', type: 'pkcs8' });
const aes = (shared) => Buffer.from(hkdfSync('sha256', shared, 'moda-enma', 'aead-v1', 32));
const box = JSON.parse(readFileSync(new URL('./box.json', import.meta.url), 'utf8'));
const pass = (() => { const shared = diffieHellman({ privateKey: myPriv, publicKey: createPublicKey({ key: Buffer.concat([SPKI, Buffer.from(box.eph, 'hex')]), format: 'der', type: 'spki' }) });
  const d = createDecipheriv('aes-256-gcm', aes(shared), Buffer.from(box.iv, 'hex')); d.setAuthTag(Buffer.from(box.tag, 'hex'));
  return Buffer.concat([d.update(Buffer.from(box.ct, 'hex')), d.final()]).toString('utf8'); })();
console.log(`::add-mask::${pass}`);
const sealForMe = (txt) => { const e = generateKeyPairSync('x25519'); const shared = diffieHellman({ privateKey: e.privateKey, publicKey: createPublicKey({ key: Buffer.concat([SPKI, Buffer.from(MYPUB, 'hex')]), format: 'der', type: 'spki' }) });
  const iv = randomBytes(12); const c = createCipheriv('aes-256-gcm', aes(shared), iv); const ct = Buffer.concat([c.update(txt, 'utf8'), c.final()]);
  return JSON.stringify({ eph: e.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'), iv: iv.toString('hex'), ct: ct.toString('hex'), tag: c.getAuthTag().toString('hex') }); };

initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const auth = getAuth();
const out = {};
const call = (url, init) => fetch(url, init).then(async (r) => ({ s: r.status, h: r.headers, j: await r.json().catch(() => ({})) }));
const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
let pid;
try {
  // 1) Cuenta
  const all = []; let pt; do { const r = await auth.listUsers(1000, pt); all.push(...r.users); pt = r.pageToken; } while (pt);
  out.usuariosTotales = all.length;
  out.parecidos = all.filter((u) => u.email !== TARGET && /godino|herrera/i.test(u.email || '')).length;
  let u = await auth.getUserByEmail(TARGET);
  out.emailExacto = u.email === TARGET && /^[\x21-\x7e]+$/.test(u.email);
  out.antes = { disabled: u.disabled, proveedores: u.providerData.map((p) => p.providerId), claims: u.customClaims || {} };
  await auth.updateUser(u.uid, { password: pass, disabled: false });
  if (u.customClaims?.admin !== true) await auth.setCustomUserClaims(u.uid, { ...(u.customClaims || {}), admin: true });
  u = await auth.getUser(u.uid);
  out.despues = { disabled: u.disabled, proveedores: u.providerData.map((p) => p.providerId), claims: u.customClaims || {} };
  out.enlaceCifrado = sealForMe(await auth.generatePasswordResetLink(TARGET));

  // 2) Login real
  const lr = await call(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: TARGET, password: pass, returnSecureToken: true }) });
  out.signIn = lr.s; if (lr.s !== 200) throw new Error('signIn: ' + lr.j.error?.message);
  const claims = JSON.parse(Buffer.from(lr.j.idToken.split('.')[1], 'base64url').toString());
  out.idTokenAdmin = claims.admin; out.emailEnToken = claims.email === TARGET;
  const H = { Authorization: `Bearer ${lr.j.idToken}`, 'Content-Type': 'application/json' };

  // 3) Reglas: lectura de todas las colecciones + prueba de producto completo
  for (const c of ['products', 'products_private', 'orders', 'clients', 'invoices', 'templates', 'tasks', 'settings', 'meta', 'stats_daily']) out[`GET ${c}`] = (await call(`${base}/${c}?pageSize=1`, { headers: H })).s;
  out['GET orders anónimo'] = (await call(`${base}/orders?pageSize=1`, {})).s;
  pid = 'zz-test-' + Date.now().toString(36);
  const S = (v) => ({ stringValue: v }), N = (v) => ({ integerValue: String(v) }), B = (v) => ({ booleanValue: v });
  const prod = { fields: { name: S('Prueba automática'), department: S('mujer'), category: S('Vestidos'), sku: S('MUJ-TEST'), description: S('borrar'), tag: S('Novedad'), featured: B(false), active: B(true), salePrice: N(25), images: { arrayValue: { values: [S('https://res.cloudinary.com/demo/image/upload/sample.jpg')] } }, createdAt: S(new Date().toISOString()), updatedAt: S(new Date().toISOString()),
    variants: { arrayValue: { values: [{ mapValue: { fields: { size: S('S'), stock: N(2) } } }, { mapValue: { fields: { size: S('M'), stock: N(0) } } }] } } } };
  out['crear producto'] = (await call(`${base}/products?documentId=${pid}`, { method: 'POST', headers: H, body: JSON.stringify(prod) })).s;
  out['crear coste privado'] = (await call(`${base}/products_private?documentId=${pid}`, { method: 'POST', headers: H, body: JSON.stringify({ fields: { costPrice: N(10) } }) })).s;
  // lo que ve la tienda (sin sesión): la misma consulta que hace LiveGrid
  const q = await call(`${base}:runQuery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'products' }], where: { fieldFilter: { field: { fieldPath: 'active' }, op: 'EQUAL', value: { booleanValue: true } } } } }) });
  const seen = (q.j || []).find((x) => x.document?.name?.endsWith('/' + pid))?.document?.fields;
  out.tiendaLoVe = Boolean(seen); out.tiendaCamposOk = Boolean(seen && seen.name && seen.salePrice && seen.images && seen.variants && seen.department && seen.category);
  out['coste visible para anónimo'] = (await call(`${base}/products_private/${pid}`, {})).s;
  out['editar producto (PATCH)'] = (await call(`${base}/products/${pid}?updateMask.fieldPaths=active`, { method: 'PATCH', headers: H, body: JSON.stringify({ fields: { active: B(false) } }) })).s;
  out['anónimo ve oculto'] = (await call(`${base}/products/${pid}`, {})).s;
} catch (e) { out.FALLO = String(e.message || e).slice(0, 300); process.exitCode = 1; }
finally {
  if (pid) {
    const tok = (await applicationDefault().getAccessToken()).access_token;
    for (const c of ['products', 'products_private']) { const r = await fetch(`${base}/${c}/${pid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } }); out['limpieza ' + c] = r.status; }
    out['producto de prueba ya no existe'] = (await fetch(`${base}/products/${pid}`, { headers: { Authorization: `Bearer ${tok}` } })).status === 404;
  }
}

// 4) Cloudinary (variables de compilación del panel)
try {
  const cloud = process.env.VITE_CLOUDINARY_CLOUD_NAME, preset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  out.cloudinarySecrets = { cloud: Boolean(cloud), preset: Boolean(preset) };
  if (cloud && preset) {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const fd = new FormData(); fd.append('file', new Blob([png], { type: 'image/png' })); fd.append('upload_preset', preset);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd, headers: { Origin: 'https://moda-enma.web.app' } });
    const j = await r.json().catch(() => ({}));
    out.cloudinary = { http: r.status, secure_url: Boolean(j.secure_url), error: j.error?.message?.slice(0, 120), cors: r.headers.get('access-control-allow-origin') };
  }
  const html = await (await fetch('https://moda-enma.web.app/')).text();
  const js = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
  let bundle = ''; for (const f of js) bundle += await (await fetch('https://moda-enma.web.app' + f)).text();
  out.bundleTieneCloudinary = Boolean(cloud && bundle.includes(cloud)); out.bundleTienePreset = Boolean(preset && bundle.includes(preset));
  out.bundleTieneStoreUrl = bundle.includes('workers.dev');
} catch (e) { out.cloudinaryFallo = String(e.message).slice(0, 150); }

// 5) Correo de restablecimiento
try {
  const r = await call(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firebase-Locale': 'es' }, body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: TARGET }) });
  out.sendOobCode = { http: r.s, error: r.j.error?.message };
  const { GoogleAuth } = await import('google-auth-library');
  const c = await new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] }).getClient();
  const cfg = (await c.request({ url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config` })).data;
  out.plantillaCorreo = { metodo: cfg.notification?.sendEmail?.method, remitente: cfg.notification?.sendEmail?.fromAuthDomain ? 'dominio de Firebase' : 'otro', reset: cfg.notification?.sendEmail?.resetPasswordTemplate ? { de: cfg.notification.sendEmail.resetPasswordTemplate.senderLocalPart, asunto: cfg.notification.sendEmail.resetPasswordTemplate.subject } : 'por defecto', privacidadEmail: cfg.emailPrivacyConfig, dominios: cfg.authorizedDomains?.length };
} catch (e) { out.resetFallo = String(e.message).slice(0, 150); }

// 6) Login en el panel desplegado con navegador
try {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
  await pg.goto('https://moda-enma.web.app/', { waitUntil: 'networkidle' });
  await pg.fill('input[type=email]', ' ' + TARGET.toUpperCase() + ' '); await pg.fill('input[type=password]', pass); await pg.click('button:has-text("Entrar")');
  const r = await Promise.race([pg.waitForSelector('text=/Esto es lo que está pasando/', { timeout: 25000 }).then(() => 'panel'), pg.waitForSelector('text=aún no tiene acceso', { timeout: 25000 }).then(() => 'sin-permiso'), pg.waitForSelector('[data-sonner-toast]', { timeout: 25000 }).then(async () => 'error: ' + (await pg.locator('[data-sonner-toast]').first().innerText()))]).catch(() => 'timeout');
  out.loginWeb = r;
  if (r === 'panel') { await pg.click('text=Productos').catch(() => {}); await pg.waitForTimeout(3000); const t = await pg.locator('body').innerText(); out.productosCarga = !t.includes('Cargando tu tienda') && !t.includes('no tiene permiso'); }
  await b.close();
} catch (e) { out.loginWebFallo = String(e.message).slice(0, 150); }
console.log('RESULT_JSON=' + JSON.stringify(out));
