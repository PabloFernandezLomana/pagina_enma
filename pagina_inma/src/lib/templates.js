// pagina_inma/src/lib/templates.js — mensajes de WhatsApp. Se envían SOLO cuando tú pulsas el botón.
export const DEFAULT_TEMPLATES = {
  Pendiente: '¡Hola {nombre}! 🌸 Gracias por tu pedido {pedido} en ModaEnma. Lo hemos recibido y ya lo estamos revisando. Total: {total}.',
  Preparando: 'Hola {nombre} ✨ Estamos preparando tu pedido {pedido}. En cuanto esté listo te aviso.',
  Enviado: '¡Buenas noticias, {nombre}! 📦 Tu pedido {pedido} ya va de camino. Si tienes cualquier duda, escríbeme por aquí.',
  Entregado: '¡Hola {nombre}! 💛 Tu pedido {pedido} ya está entregado. Gracias por confiar en ModaEnma, ¡espero que te encante!',
  Cancelado: 'Hola {nombre}. Tu pedido {pedido} se ha cancelado. Si ha sido un error o quieres hacer otro, escríbeme y lo arreglamos.',
  Cobro: 'Hola {nombre} 🌷 Te recuerdo que queda pendiente el pago de tu pedido {pedido} ({total}). Puedes pagarme en mano cuando quedemos. ¡Gracias!',
};
export const TEMPLATE_LABELS = { Pendiente: 'Pedido recibido', Preparando: 'Preparando el pedido', Enviado: 'Pedido enviado', Entregado: 'Pedido entregado', Cancelado: 'Pedido cancelado', Cobro: 'Recordar el pago' };

export function fillTemplate(text, order) {
  const first = String(order.clientName || '').trim().split(/\s+/)[0] || '';
  return text
    .replaceAll('{nombre}', first)
    .replaceAll('{pedido}', order.id)
    .replaceAll('{total}', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total || 0));
}
