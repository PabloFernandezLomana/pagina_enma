// site.config.js — FUENTE ÚNICA DE VERDAD (raíz del repo)
// Tras editar este archivo ejecuta:  node scripts/sync-shared.mjs
// (copia este archivo y tokens.css a la tienda y al panel).
//
// Los datos que dejes vacíos ("") NO se inventan: la web simplemente no muestra
// ese dato (botón de Instagram, teléfono, etc.). Los textos legales sí necesitan
// titular, NIF y dirección antes de vender de verdad (ver LANZAMIENTO.md).

export const SITE_CONFIG = {
  brand: {
    name: 'ModaEnma',
    tagline: 'Moda cercana desde Málaga',
    description:
      'Ropa, deporte y accesorios elegidos con mimo. Compra online y recibe en casa o quedamos en Málaga.',
    city: 'Málaga',
    country: 'España',
    domain: '', // p. ej. 'https://modaenma.es' (sin barra final). Se usa para SEO y enlaces absolutos.
    legalName: '', // Nombre y apellidos o razón social del titular
    nif: '',
    address: '',
    phone: '',
    whatsapp: '34610712927', // solo dígitos con prefijo, p. ej. '34600111222'
    email: '',
  },

  social: {
    instagram: '', // URL completa, p. ej. 'https://instagram.com/modaenma'
    tiktok: '',
    facebook: '',
  },

  shipping: {
    currency: 'EUR',
    // Un único coste de envío; no hay envío gratis (déjalo en null).
    freeShippingThreshold: null,
    methods: {
      delivery: {
        enabled: true,
        label: 'Envío a domicilio',
        description: 'Recíbelo en casa en 2-4 días laborables.',
        cost: 3.9,
        payments: ['paypal'], // el envío solo se paga por PayPal
      },
      meetup: {
        enabled: true,
        label: 'Quedar en persona (Málaga)',
        description: 'Quedamos en Málaga y pagas en efectivo o por PayPal.',
        cost: 0,
        payments: ['cash', 'paypal'],
      },
    },
    shipsTo: 'España peninsular',
  },

  payments: {
    // Los dos únicos métodos del proyecto.
    labels: { paypal: 'PayPal', cash: 'Pago en efectivo' },
  },

  legal: {
    withdrawalDays: 14,
    taxIncludedText: 'Precios con IVA incluido',
    policyVersion: '2026-11',
  },

  invoices: {
    // El panel emite facturas SIN desglose de IVA (precio final con IVA incluido).
    showVatBreakdown: false,
    prefix: 'FACT',
  },
};

export const hasValue = (v) => typeof v === 'string' && v.trim().length > 0;

export function shippingCostFor(method, subtotal) {
  const m = SITE_CONFIG.shipping.methods[method];
  if (!m || !m.enabled) return null;
  const thr = SITE_CONFIG.shipping.freeShippingThreshold;
  if (thr != null && subtotal >= thr) return 0;
  return m.cost;
}

export function allowedPayments(method) {
  const m = SITE_CONFIG.shipping.methods[method];
  return m && m.enabled ? m.payments : [];
}

/** Enlace wa.me al WhatsApp de la tienda con un mensaje ya escrito. Devuelve '' si no hay número. */
export function whatsappLink(text = '') {
  const n = String(SITE_CONFIG.brand.whatsapp || '').replace(/\D/g, '');
  if (!n) return '';
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Dirección pública de la tienda, SIEMPRE sin barra final (evita enlaces con "//"). */
export const DEFAULT_SITE_URL = 'https://modaenma-tienda.tiendaenma.workers.dev';
export function siteUrl() {
  const clean = (u) => String(u || '').trim().replace(/\/+$/, '');
  if (hasValue(SITE_CONFIG.brand.domain)) return clean(SITE_CONFIG.brand.domain);
  const env = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (env) return env;
  return process.env.NODE_ENV === 'production' ? DEFAULT_SITE_URL : 'http://localhost:3000';
}

export default SITE_CONFIG;
