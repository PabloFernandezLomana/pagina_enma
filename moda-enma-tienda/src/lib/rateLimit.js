// moda-enma-tienda/src/lib/rateLimit.js
// Limitador sencillo en memoria (por instancia). Frena abusos básicos; no sustituye a un WAF.
const buckets = new Map();

export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || hit.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  hit.count += 1;
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  return hit.count <= max;
}

/** IP real del cliente. En Cloudflare, `cf-connecting-ip` lo pone Cloudflare y no se puede falsificar;
 *  `x-forwarded-for` lo escribe el cliente y solo se usa como último recurso (desarrollo local). */
export function clientIp(request) {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',').pop() : request.headers.get('x-real-ip') || 'unknown').trim();
}
