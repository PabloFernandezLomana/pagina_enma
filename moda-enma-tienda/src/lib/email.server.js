// moda-enma-tienda/src/lib/email.server.js
// Envío de correos por API REST (fetch), sin librerías: funciona en Cloudflare Workers.
// Proveedores: Brevo (plan gratuito, no exige dominio propio) o Resend (necesita dominio verificado).
//
// Variables (secretos en Cloudflare):
//   BREVO_API_KEY  o  RESEND_API_KEY     → clave del proveedor (si pones las dos, EMAIL_PROVIDER decide)
//   EMAIL_PROVIDER = brevo | resend      → opcional
//   EMAIL_FROM                           → remitente verificado, p. ej. pedidos@tudominio.es
//   EMAIL_FROM_NAME                      → opcional (por defecto, el nombre de la tienda)
//   EMAIL_REPLY_TO                       → opcional (por defecto, el correo de contacto de site.config.js)
import { SITE_CONFIG, hasValue } from '@/site.config';

export function emailProvider() {
  const p = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (p === 'resend' && process.env.RESEND_API_KEY) return 'resend';
  if (p === 'brevo' && process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.RESEND_API_KEY) return 'resend';
  return null;
}

export const emailConfigured = () => Boolean(emailProvider() && process.env.EMAIL_FROM);

async function post(url, headers, body, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

/** Devuelve { ok, skipped?, error? }. Nunca lanza: un fallo de correo no debe romper una compra. */
export async function sendEmail({ to, toName = '', subject, html, text }) {
  const provider = emailProvider();
  const from = process.env.EMAIL_FROM;
  if (!provider || !from) return { ok: false, skipped: true, error: 'Correo sin configurar' };
  if (!/^\S+@\S+\.\S+$/.test(String(to || ''))) return { ok: false, skipped: true, error: 'El cliente no tiene un correo válido' };

  const fromName = process.env.EMAIL_FROM_NAME || SITE_CONFIG.brand.name;
  const replyTo = process.env.EMAIL_REPLY_TO || (hasValue(SITE_CONFIG.brand.email) ? SITE_CONFIG.brand.email : '');
  try {
    let r;
    if (provider === 'brevo') {
      r = await post('https://api.brevo.com/v3/smtp/email', { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json' }, {
        sender: { name: fromName, email: from },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        textContent: text,
        ...(replyTo ? { replyTo: { email: replyTo, name: fromName } } : {}),
      });
    } else {
      r = await post('https://api.resend.com/emails', { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, {
        from: `${fromName} <${from}>`,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      });
    }
    if (!r.ok) return { ok: false, error: `${provider} ${r.status}: ${r.text.slice(0, 200)}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `${provider}: ${err.name === 'AbortError' ? 'tiempo agotado' : err.message}` };
  }
}
