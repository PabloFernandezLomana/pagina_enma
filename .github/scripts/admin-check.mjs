// Diagnóstico 2: configuración de Auth, estado de bloqueo de la cuenta y antigüedad de sesiones. Sin imprimir datos personales.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleAuth } from 'google-auth-library';
const TARGET = 'lgodinoherrera@gmail.com', REF = 'pablo.lomana.h@gmail.com';
const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID, KEY = process.env.VITE_FIREBASE_API_KEY;
initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const auth = getAuth();
const days = (s) => (s ? Math.round((Date.now() - Date.parse(s)) / 86400000) : null);
for (const [name, email] of [['objetivo', TARGET], ['referencia', REF]]) {
  const u = await auth.getUserByEmail(email);
  console.log(name, { creadaHaceDias: days(u.metadata.creationTime), ultimoAccesoHaceDias: days(u.metadata.lastSignInTime), ultimoRefrescoHaceDias: days(u.metadata.lastRefreshTime), tokensValidosDesdeHaceDias: days(u.tokensValidAfterTime), mfa: (u.multiFactor?.enrolledFactors || []).length });
}
try {
  const c = await new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] }).getClient();
  const r = await c.request({ url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config` });
  const d = r.data;
  console.log('config', { emailEnabled: d.signIn?.email?.enabled, passwordRequired: d.signIn?.email?.passwordRequired, dominiosAutorizados: d.authorizedDomains, passwordPolicy: d.passwordPolicyConfig?.passwordPolicyEnforcementState || 'sin política', bloqueoFunciones: Object.keys(d.blockingFunctions || {}), mfa: d.mfa?.state, emailPrivacy: d.emailPrivacyConfig, appCheck: d.recaptchaConfig?.emailPasswordEnforcementState, quota: d.quota });
} catch (e) { console.log('config no accesible:', e.code || e.message?.slice(0, 160)); }
// Sonda de bloqueo: una contraseña aleatoria. Si responde TOO_MANY_ATTEMPTS la cuenta está bloqueada temporalmente.
const probe = async (email) => { const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'x-' + Math.random().toString(36).slice(2) + 'Zq9!', returnSecureToken: true }) }); return (await r.json()).error?.message || 'OK?'; };
console.log('sonda objetivo:', await probe(TARGET));
console.log('sonda referencia:', await probe(REF));
