// moda-enma-tienda/src/lib/adminAuth.server.js
// Comprueba que quien llama es la administradora del panel (sesión de Firebase con permiso de administrador).
// Usa el servicio de Google Identity Toolkit: devuelve los permisos (customAttributes) del usuario del token.
export async function verifyAdminToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!idToken || !apiKey) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const user = (await res.json()).users?.[0];
    if (!user || user.disabled) return null;
    let claims = {};
    try { claims = JSON.parse(user.customAttributes || '{}'); } catch { /* sin permisos */ }
    if (claims.admin === true || claims.role === 'admin') return { uid: user.localId, email: user.email };
    return null;
  } catch {
    return null;
  }
}

/** Orígenes del panel que pueden llamar a la tienda (CORS). PANEL_ORIGIN admite varios separados por comas. */
export function allowedOrigins() {
  const list = (process.env.PANEL_ORIGIN || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (project) list.push(`https://${project}.web.app`, `https://${project}.firebaseapp.com`);
  if (process.env.NODE_ENV !== 'production') list.push('http://localhost:5173', 'http://localhost:5180');
  return list;
}
