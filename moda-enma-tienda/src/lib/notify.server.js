// moda-enma-tienda/src/lib/notify.server.js
// Orquesta los correos al cliente. Nunca lanza: un fallo de correo no debe romper una compra ni un cambio de estado.
// Es idempotente: PayPal puede avisar por dos vías (captura del navegador y webhook) y el cliente recibe UN solo correo.
import { getAdminDb } from '@/lib/firebaseAdmin';
import { sendEmail } from '@/lib/email.server';
import { confirmationEmail, statusEmail } from '@/lib/emailTemplates';

const nowIso = () => new Date().toISOString();

/** Correo de "pedido recibido". Pago en efectivo: al crear el pedido. PayPal: cuando el pago está confirmado. */
export async function sendOrderConfirmation(orderId) {
  try {
    const db = getAdminDb();
    if (!db) return { ok: false, skipped: true, error: 'Sin base de datos' };
    const ref = db.collection('orders').doc(orderId);
    let order = null;
    await db.runTransaction(async (tx) => {
      order = null; // la transacción puede repetirse: empezamos limpio en cada intento
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const o = snap.data();
      const n = o.notifications || {};
      if (o.paymentMethod === 'paypal' && o.paymentStatus !== 'paid') return; // aún sin pagar
      if (n.confirmationSentAt) return;
      if (n.confirmationClaimedAt && Date.now() - Date.parse(n.confirmationClaimedAt) < 60_000) return; // otro proceso lo está enviando
      order = o;
      tx.set(ref, { notifications: { confirmationClaimedAt: nowIso() } }, { merge: true });
    });
    if (!order) return { ok: true, skipped: true, reason: 'nada que enviar' };

    const mail = confirmationEmail(order);
    const r = await sendEmail({ to: order.clientEmail, toName: order.clientName, ...mail });
    await ref.set(
      { notifications: r.ok ? { confirmationSentAt: nowIso(), confirmationClaimedAt: null, confirmationError: null } : { confirmationClaimedAt: null, confirmationError: r.error || 'Error' } },
      { merge: true }
    );
    if (!r.ok && !r.skipped) console.error('[email] confirmación', orderId, r.error);
    return r;
  } catch (err) {
    console.error('[email] confirmación falló', orderId, err.message);
    return { ok: false, error: err.message };
  }
}

/** Correo de cambio de estado (lo pide el panel). Evita duplicados si se pulsa dos veces seguidas. */
export async function sendOrderStatusEmail(orderId) {
  try {
    const db = getAdminDb();
    if (!db) return { ok: false, error: 'Sin base de datos' };
    const ref = db.collection('orders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return { ok: false, error: 'Pedido no encontrado' };
    const o = snap.data();
    const mail = statusEmail(o);
    if (!mail) return { ok: true, skipped: true, reason: 'Este estado no envía correo' };
    if (!o.clientEmail) return { ok: false, skipped: true, error: 'El cliente no dejó correo' };
    const last = o.notifications?.lastStatusEmail;
    if (last && last.status === o.status && Date.now() - Date.parse(last.at) < 120_000) return { ok: true, skipped: true, reason: 'Ya se avisó hace un momento' };

    const r = await sendEmail({ to: o.clientEmail, toName: o.clientName, ...mail });
    await ref.set(
      { notifications: r.ok ? { lastStatusEmail: { status: o.status, at: nowIso() }, statusError: null } : { statusError: r.error || 'Error' } },
      { merge: true }
    );
    if (!r.ok && !r.skipped) console.error('[email] estado', orderId, r.error);
    return r;
  } catch (err) {
    console.error('[email] estado falló', orderId, err.message);
    return { ok: false, error: err.message };
  }
}
