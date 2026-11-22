// moda-enma-tienda/src/lib/emailTemplates.js
// Correos al cliente. HTML sencillo con estilos en línea (los clientes de correo no admiten CSS externo).
import { SITE_CONFIG, hasValue, siteUrl, whatsappLink } from '@/site.config';

const C = { cream: '#FAF6F0', paper: '#FFFCF7', ink: '#2A2420', soft: '#63584F', terracotta: '#C4552D', line: '#EADFD0' };
const brand = SITE_CONFIG.brand.name;

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || '';

const button = (href, label, bg = C.terracotta) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 26px;border-radius:999px">${esc(label)}</a></p>`;

function layout({ preheader, title, body }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${C.cream};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.paper};border:1px solid ${C.line};border-radius:16px">
<tr><td style="padding:28px 28px 8px;font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:.04em;color:${C.ink}">${esc(brand)}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:16px;line-height:1.55">${body}</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid ${C.line};font-size:13px;line-height:1.5;color:${C.soft}">
${esc(brand)} · ${esc(SITE_CONFIG.brand.city)}${hasValue(SITE_CONFIG.brand.email) ? ` · ${esc(SITE_CONFIG.brand.email)}` : ''}<br>
Tienes ${SITE_CONFIG.legal.withdrawalDays} días naturales para desistir de la compra desde que la recibes.
</td></tr></table></td></tr></table></body></html>`;
}

const itemsTable = (o) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;border-collapse:collapse">
${o.items.map((l) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}"><b>${esc(l.productName)}</b><br><span style="color:${C.soft};font-size:14px">Talla ${esc(l.size)} · ${l.quantity} × ${eur(l.unitPrice)}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};white-space:nowrap">${eur(l.total)}</td></tr>`).join('')}
<tr><td style="padding:8px 0;color:${C.soft}">Productos</td><td align="right" style="padding:8px 0">${eur(o.subtotal)}</td></tr>
<tr><td style="padding:2px 0;color:${C.soft}">Envío</td><td align="right" style="padding:2px 0">${o.shippingCost ? eur(o.shippingCost) : 'Gratis'}</td></tr>
<tr><td style="padding:10px 0;font-size:18px"><b>Total</b> <span style="color:${C.soft};font-size:13px">(${esc(SITE_CONFIG.legal.taxIncludedText)})</span></td><td align="right" style="padding:10px 0;font-size:18px"><b>${eur(o.total)}</b></td></tr>
</table>`;

const itemsText = (o) => o.items.map((l) => `- ${l.productName} (talla ${l.size}) x${l.quantity}: ${eur(l.total)}`).join('\n');

export function meetupWhatsAppText(o) {
  return `Hola, soy ${o.clientName}. He hecho el pedido ${o.id} en ${brand} y quiero quedar en ${SITE_CONFIG.brand.city} para recogerlo. ¿Qué día, hora y lugar te vienen bien?`;
}

const orderLink = (o) => (o.accessToken ? `${siteUrl()}/pedido/${encodeURIComponent(o.id)}?t=${o.accessToken}` : '');

/* ───────────── confirmación de compra ───────────── */
export function confirmationEmail(o) {
  const meetup = o.shippingMethod === 'meetup';
  const paid = o.paymentStatus === 'paid';
  const wa = whatsappLink(meetupWhatsAppText(o));
  const link = orderLink(o);

  let how;
  let howText;
  if (meetup) {
    how = `<p><b>Quedamos en ${esc(SITE_CONFIG.brand.city)}.</b> El día, la hora y el lugar los acordamos tú y yo por WhatsApp, cuando mejor nos venga a los dos.</p>${wa ? button(wa, 'Escribirme por WhatsApp', '#1FA855') : ''}
<p style="color:${C.soft};font-size:14px">${paid ? 'Ya has pagado con PayPal.' : `Pagas en mano al recibirlo: <b>${eur(o.total)}</b>.`}</p>`;
    howText = `Quedamos en ${SITE_CONFIG.brand.city}. El día, la hora y el lugar los acordamos por WhatsApp, cuando nos venga bien a los dos.${wa ? `\nEscríbeme aquí: ${wa}` : ''}\n${paid ? 'Ya has pagado con PayPal.' : `Pagas en mano al recibirlo: ${eur(o.total)}.`}`;
  } else {
    how = `<p><b>Envío a domicilio</b> a:<br>${esc(o.clientAddress)}</p><p>Lo enviamos en 2-4 días laborables. Te avisaremos por correo cuando salga.</p>
<p style="color:${C.soft};font-size:14px">Pago con PayPal: recibido.</p>`;
    howText = `Envío a domicilio a: ${o.clientAddress}\nLo enviamos en 2-4 días laborables. Te avisaremos cuando salga.\nPago con PayPal: recibido.`;
  }

  const subject = `Pedido ${o.id} recibido · ${brand}`;
  const html = layout({
    preheader: `Hemos recibido tu pedido ${o.id}`,
    title: subject,
    body: `<h1 style="font-family:Georgia,serif;font-size:26px;margin:8px 0 4px">¡Gracias${firstName(o.clientName) ? `, ${esc(firstName(o.clientName))}` : ''}!</h1>
<p style="margin:0 0 12px">Hemos recibido tu pedido <b>${esc(o.id)}</b>.</p>
${itemsTable(o)}${how}${link ? `<p style="font-size:14px"><a href="${esc(link)}" style="color:${C.terracotta}">Ver el estado de mi pedido</a></p>` : ''}`,
  });
  const text = `¡Gracias${firstName(o.clientName) ? `, ${firstName(o.clientName)}` : ''}!\nHemos recibido tu pedido ${o.id}.\n\n${itemsText(o)}\nEnvío: ${o.shippingCost ? eur(o.shippingCost) : 'Gratis'}\nTotal: ${eur(o.total)} (${SITE_CONFIG.legal.taxIncludedText})\n\n${howText}${link ? `\n\nEstado de tu pedido: ${link}` : ''}\n\n${brand}`;
  return { subject, html, text };
}

/* ───────────── cambio de estado ───────────── */
export const EMAILED_STATUSES = ['Preparando', 'Enviado', 'Entregado', 'Cancelado'];

export function statusEmail(o) {
  if (!EMAILED_STATUSES.includes(o.status)) return null;
  const meetup = o.shippingMethod === 'meetup';
  const wa = whatsappLink(meetupWhatsAppText(o));
  const link = orderLink(o);
  const tracking = o.trackingCode ? `${o.carrier ? `${o.carrier}: ` : 'Código de seguimiento: '}${o.trackingCode}` : '';
  let headline;
  let lines = [];
  let extraHtml = '';

  if (o.status === 'Preparando') {
    headline = meetup ? 'Tu pedido está listo para la quedada' : 'Estamos preparando tu pedido';
    lines = meetup
      ? [`Tu pedido ${o.id} ya está preparado. Escríbeme por WhatsApp y acordamos día, hora y lugar en ${SITE_CONFIG.brand.city}.`]
      : [`Estamos preparando tu pedido ${o.id}. Te avisaremos en cuanto salga.`];
    if (meetup && wa) extraHtml = button(wa, 'Escribirme por WhatsApp', '#1FA855');
  } else if (o.status === 'Enviado') {
    headline = '¡Tu pedido va de camino!';
    lines = meetup
      ? [`Tu pedido ${o.id} está en marcha. Escríbeme por WhatsApp para acordar la entrega.`]
      : [`Tu pedido ${o.id} ya ha salido hacia ${o.clientAddress}. Suele tardar 2-4 días laborables.`];
    if (!meetup && tracking) lines.push(tracking);
    if (meetup && wa) extraHtml = button(wa, 'Escribirme por WhatsApp', '#1FA855');
  } else if (o.status === 'Entregado') {
    headline = '¡Entregado!';
    lines = [`Tu pedido ${o.id} ya está en tus manos. Gracias por confiar en ${brand}. Si algo no es como esperabas, escríbenos.`];
  } else {
    headline = 'Tu pedido se ha cancelado';
    lines = [`Hemos cancelado el pedido ${o.id}.${o.paymentMethod === 'paypal' && o.paymentStatus === 'paid' ? ' Te devolveremos el dinero por PayPal.' : ''} Si tienes dudas, escríbenos.`];
    if (wa) extraHtml = button(wa, 'Escribirme por WhatsApp', '#1FA855');
  }

  const subject = `${headline.replace(/[¡!]/g, '')} · ${o.id}`.trim();
  const html = layout({
    preheader: lines[0],
    title: subject,
    body: `<h1 style="font-family:Georgia,serif;font-size:26px;margin:8px 0 8px">${esc(headline)}</h1>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}${extraHtml}${link ? `<p style="font-size:14px"><a href="${esc(link)}" style="color:${C.terracotta}">Ver el estado de mi pedido</a></p>` : ''}`,
  });
  const text = `${headline}\n\n${lines.join('\n')}${meetup && wa && o.status !== 'Entregado' ? `\n\nWhatsApp: ${wa}` : ''}${link ? `\n\nEstado de tu pedido: ${link}` : ''}\n\n${brand}`;
  return { subject, html, text };
}
