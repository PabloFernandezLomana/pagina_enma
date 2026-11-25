import { GoogleAuth } from 'google-auth-library';
const P = process.env.VITE_FIREBASE_PROJECT_ID;
const c = await new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] }).getClient();
const mk = (subject, intro, cta) => ({ senderLocalPart: 'noreply', senderDisplayName: 'ModaEnma', subject, bodyFormat: 'HTML', body: `<p>Hola,</p><p>${intro}</p><p><a href="%LINK%">${cta}</a></p><p>Si no lo has pedido tú, puedes ignorar este correo: tu contraseña no cambiará.</p><p>ModaEnma</p>` });
const body = { notification: { sendEmail: { resetPasswordTemplate: mk('Cambia tu contraseña de ModaEnma', 'Has pedido cambiar la contraseña de tu panel de ModaEnma. Pulsa el botón para elegir una nueva:', 'Cambiar mi contraseña') } } };
try {
  const r = await c.request({ method: 'PATCH', url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${P}/config?updateMask=notification.sendEmail.resetPasswordTemplate`, data: body });
  console.log('RESULT_JSON=' + JSON.stringify({ plantillaActualizada: r.status, asunto: r.data.notification?.sendEmail?.resetPasswordTemplate?.subject }));
} catch (e) { console.log('RESULT_JSON=' + JSON.stringify({ error: e.code || e.status, msg: String(e.message).slice(0, 200) })); }
