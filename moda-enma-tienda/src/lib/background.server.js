// moda-enma-tienda/src/lib/background.server.js
// Ejecuta una tarea sin hacer esperar al cliente (en Cloudflare: ctx.waitUntil). Fuera de Cloudflare, la espera.
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function runInBackground(promise) {
  const safe = Promise.resolve(promise).catch((err) => console.error('[background]', err?.message || err));
  try {
    const { ctx } = getCloudflareContext();
    if (ctx?.waitUntil) { ctx.waitUntil(safe); return; }
  } catch { /* no estamos en un Worker */ }
  await safe;
}
