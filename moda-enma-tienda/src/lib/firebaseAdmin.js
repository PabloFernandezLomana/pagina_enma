// moda-enma-tienda/src/lib/firebaseAdmin.js
// Acceso a Firestore DESDE EL SERVIDOR sin firebase-admin (que no funciona en Cloudflare Workers).
// Habla con la API REST de Firestore usando la cuenta de servicio (JWT firmado con WebCrypto).
// Mantiene la misma forma de uso que el SDK de administrador: db.collection().doc().get(), runTransaction, etc.
//
// Credenciales (cualquiera de las dos formas):
//   FIREBASE_SERVICE_ACCOUNT_KEY = JSON completo de la clave (o ese JSON en base64)
//   FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + NEXT_PUBLIC_FIREBASE_PROJECT_ID

const API = 'https://firestore.googleapis.com/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/datastore';

/* ───────────── valores ───────────── */
class Increment {
  constructor(n) { this.n = n; }
}
export const FieldValue = { increment: (n) => new Increment(n) };

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof Increment);

export function encodeValue(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return { nullValue: null };
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.filter((x) => x !== undefined).map(encodeValue) } };
  if (isPlainObject(v)) return { mapValue: { fields: encodeFields(v) } };
  throw new Error('Valor no soportado en Firestore');
}

export function encodeFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = encodeValue(v);
  return out;
}

export function decodeValue(v) {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  if ('referenceValue' in v) return v.referenceValue;
  return null;
}

export function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = decodeValue(v);
  return out;
}

const fieldPath = (segments) =>
  segments.map((s) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s) ? s : '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`')).join('.');

/** Recorre un objeto: separa valores normales (con su ruta, para fusionar en profundidad) de los incrementos. */
function build(obj, prefix = []) {
  const fields = {};
  const leaves = [];
  const transforms = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const path = [...prefix, k];
    if (v instanceof Increment) {
      transforms.push({ fieldPath: fieldPath(path), increment: encodeValue(v.n) });
    } else if (isPlainObject(v) && Object.keys(v).length > 0) {
      const sub = build(v, path);
      if (Object.keys(sub.fields).length) fields[k] = { mapValue: { fields: sub.fields } };
      leaves.push(...sub.leaves);
      transforms.push(...sub.transforms);
    } else {
      fields[k] = encodeValue(v);
      leaves.push(fieldPath(path));
    }
  }
  return { fields, leaves, transforms };
}

/* ───────────── autenticación ───────────── */
function b64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

let tokenCache = null;
let tokenPromise = null;

export async function signJwt(key, nowSec = Math.floor(Date.now() / 1000)) {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: nowSec, exp: nowSec + 3600 }));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', pemToDer(key.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(`${header}.${claims}`));
  return `${header}.${claims}.${b64url(sig)}`;
}

async function getAccessToken(key) {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token;
  if (!tokenPromise) {
    tokenPromise = (async () => {
      const assertion = await signJwt(key);
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.access_token) throw new Error(`No se pudo autenticar con Google (${res.status}): ${json.error_description || json.error || ''}`);
      tokenCache = { token: json.access_token, exp: Date.now() + (Number(json.expires_in) || 3600) * 1000 };
      return tokenCache.token;
    })().finally(() => { tokenPromise = null; });
  }
  return tokenPromise;
}

/* ───────────── cliente REST ───────────── */
class FirestoreError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Snapshot {
  constructor(ref, fields) {
    this.ref = ref;
    this.id = ref.id;
    this.exists = fields !== null;
    this._fields = fields;
  }
  data() {
    return this.exists ? decodeFields(this._fields) : undefined;
  }
}

class DocRef {
  constructor(db, path) {
    this.db = db;
    this.path = path;
    this.id = path.split('/').pop();
  }
  get name() { return `${this.db.base}/${this.path}`; }
  async get() { return (await this.db._batchGet([this]))[0]; }
  async set(data, opts = {}) { await this.db._commit([this.db._writeSet(this, data, opts)]); }
  async update(data) { await this.db._commit([this.db._writeUpdate(this, data)]); }
}

class Query {
  constructor(db, collectionId, filters = []) {
    this.db = db;
    this.collectionId = collectionId;
    this.filters = filters;
  }
  where(field, op, value) {
    return new Query(this.db, this.collectionId, [...this.filters, { field, op, value }]);
  }
  async get() {
    const OPS = { '==': 'EQUAL', '<': 'LESS_THAN', '<=': 'LESS_THAN_OR_EQUAL', '>': 'GREATER_THAN', '>=': 'GREATER_THAN_OR_EQUAL' };
    const filters = this.filters.map((f) => ({ fieldFilter: { field: { fieldPath: f.field }, op: OPS[f.op], value: encodeValue(f.value) } }));
    const structuredQuery = { from: [{ collectionId: this.collectionId }] };
    if (filters.length === 1) structuredQuery.where = filters[0];
    else if (filters.length > 1) structuredQuery.where = { compositeFilter: { op: 'AND', filters } };
    const rows = await this.db._request(`${this.db.base}:runQuery`, { structuredQuery });
    const docs = rows.filter((r) => r.document).map((r) => {
      const path = r.document.name.split('/documents/')[1];
      return new Snapshot(new DocRef(this.db, path), r.document.fields || {});
    });
    return { docs, size: docs.length, empty: docs.length === 0 };
  }
}

class Transaction {
  constructor(db, id) {
    this.db = db;
    this.id = id;
    this.writes = [];
  }
  async getAll(...refs) { return this.db._batchGet(refs, this.id); }
  async get(ref) { return (await this.getAll(ref))[0]; }
  set(ref, data, opts = {}) { this.writes.push(this.db._writeSet(ref, data, opts)); return this; }
  update(ref, data) { this.writes.push(this.db._writeUpdate(ref, data)); return this; }
}

class RestFirestore {
  constructor(key) {
    this.key = key;
    this.projectId = key.project_id;
    this.base = `projects/${this.projectId}/databases/(default)/documents`;
  }

  collection(name) {
    const db = this;
    return {
      doc: (id) => new DocRef(db, `${name}/${id}`),
      where: (f, o, v) => new Query(db, name).where(f, o, v),
    };
  }
  doc(path) { return new DocRef(this, path); }

  async _request(path, body, method = 'POST') {
    const token = await getAccessToken(this.key);
    const res = await fetch(`${API}/${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body || {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = json.error || {};
      throw new FirestoreError(`Firestore ${res.status} ${e.status || ''}: ${e.message || ''}`, res.status, e.status);
    }
    return json;
  }

  async _batchGet(refs, transaction) {
    if (!refs.length) return [];
    const body = { documents: refs.map((r) => r.name) };
    if (transaction) body.transaction = transaction;
    const rows = await this._request(`${this.base}:batchGet`, body);
    const found = new Map();
    for (const r of rows) if (r.found) found.set(r.found.name, r.found.fields || {});
    return refs.map((ref) => new Snapshot(ref, found.has(ref.name) ? found.get(ref.name) : null));
  }

  _writeSet(ref, data, { merge = false } = {}) {
    if (!merge) {
      const { fields, transforms } = build(data);
      const w = { update: { name: ref.name, fields } };
      if (transforms.length) w.updateTransforms = transforms;
      return w;
    }
    const { fields, leaves, transforms } = build(data);
    const w = { update: { name: ref.name, fields }, updateMask: { fieldPaths: leaves } };
    if (transforms.length) w.updateTransforms = transforms;
    return w;
  }

  _writeUpdate(ref, data) {
    const plain = {};
    const transforms = [];
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      if (v instanceof Increment) transforms.push({ fieldPath: fieldPath([k]), increment: encodeValue(v.n) });
      else plain[k] = v;
    }
    const w = {
      update: { name: ref.name, fields: encodeFields(plain) },
      updateMask: { fieldPaths: Object.keys(plain).map((k) => fieldPath([k])) },
      currentDocument: { exists: true },
    };
    if (transforms.length) w.updateTransforms = transforms;
    return w;
  }

  async _commit(writes, transaction) {
    const body = { writes };
    if (transaction) body.transaction = transaction;
    return this._request(`${this.base}:commit`, body);
  }

  /** Igual que en el SDK: lee, valida y escribe de forma atómica. Reintenta si hay choque con otra compra. */
  async runTransaction(fn, { maxAttempts = 5 } = {}) {
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { transaction } = await this._request(`${this.base}:beginTransaction`, { options: { readWrite: {} } });
      const tx = new Transaction(this, transaction);
      try {
        const result = await fn(tx);
        await this._commit(tx.writes, transaction);
        return result;
      } catch (err) {
        this._request(`${this.base}:rollback`, { transaction }).catch(() => {});
        const retryable = err instanceof FirestoreError && (err.code === 'ABORTED' || err.status === 409);
        if (!retryable) throw err;
        lastErr = err;
        await sleep(40 * attempt + Math.random() * 60);
      }
    }
    throw lastErr;
  }
}

/* ───────────── inicio ───────────── */
let db = null;
let initError = null;
let tried = false;

function parseKey(raw) {
  const text = raw.trim().startsWith('{') ? raw : new TextDecoder().decode(Uint8Array.from(atob(raw.trim()), (c) => c.charCodeAt(0)));
  return JSON.parse(text);
}

function readKey() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) return parseKey(raw);
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const pk = process.env.FIREBASE_PRIVATE_KEY;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (email && pk && project) return { client_email: email, private_key: pk, project_id: project };
  return null;
}

export function getAdminDb() {
  if (tried) return db;
  tried = true;
  try {
    const key = readKey();
    if (!key) return null; // sin credenciales: modo sin base de datos (solo demo en desarrollo)
    key.private_key = String(key.private_key).replace(/\\n/g, '\n');
    db = new RestFirestore(key);
  } catch (err) {
    initError = err;
    console.error('[firebaseAdmin] No se pudo iniciar:', err.message);
  }
  return db;
}
export const getAdminError = () => initError;

/** Solo para pruebas: reinicia la caché de credenciales. */
export function _resetForTests() {
  tried = false; db = null; initError = null; tokenCache = null;
}

/** El catálogo de demostración solo se permite en desarrollo o si lo activas a propósito. */
export function isDemoAllowed() {
  const flag = process.env.ALLOW_DEMO_CATALOG;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
