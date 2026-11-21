'use client';
// moda-enma-tienda/src/app/checkout/CheckoutClient.js
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { Truck, HandCoins, CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { eur } from '@/lib/format';
import { SITE_CONFIG, shippingCostFor, allowedPayments } from '@/site.config';

const PAYPAL_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_READY = Boolean(PAYPAL_ID);

export default function CheckoutClient() {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();
  const methods = SITE_CONFIG.shipping.methods;
  const firstMethod = methods.delivery.enabled && PAYPAL_READY ? 'delivery' : methods.meetup.enabled ? 'meetup' : 'delivery';

  const [shipping, setShipping] = useState(firstMethod);
  const [payment, setPayment] = useState(firstMethod === 'delivery' ? 'paypal' : 'cash');
  const [f, setF] = useState({ fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', notes: '', terms: false, honeypot: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const orderRef = useRef(null);

  const buyable = items.filter((i) => !i.soldOut);
  const shippingCost = shippingCostFor(shipping, subtotal) ?? 0;
  const total = Math.round((subtotal + shippingCost) * 100) / 100;
  const payments = allowedPayments(shipping);
  const paypalBlocked = payment === 'paypal' && !PAYPAL_READY;

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const chooseShipping = (m) => {
    setShipping(m);
    const ok = allowedPayments(m);
    if (!ok.includes(payment)) setPayment(ok[0]);
  };

  const validate = () => {
    const e = {};
    if (f.fullName.trim().length < 2) e.fullName = 'Escribe tu nombre';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Revisa el correo electrónico';
    if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Revisa el teléfono';
    if (shipping === 'delivery') {
      if (f.address.trim().length < 5) e.address = 'Escribe tu dirección completa';
      if (f.city.trim().length < 2) e.city = 'Escribe tu ciudad';
      if (!/^\d{5}$/.test(f.postalCode.trim())) e.postalCode = 'El código postal tiene 5 cifras';
    }
    if (!f.terms) e.terms = 'Debes aceptar los términos y la política de privacidad';
    if (!buyable.length) e.form = 'Tu bolsa está vacía';
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`f-${first}`)?.focus();
      toast.error('Revisa los campos marcados');
    }
    return Object.keys(e).length === 0;
  };

  const createOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: f.fullName, email: f.email, phone: f.phone, address: f.address, city: f.city, postalCode: f.postalCode, notes: f.notes,
        shippingMethod: shipping, paymentMethod: payment, termsAccepted: f.terms === true, honeypot: f.honeypot,
        items: buyable.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.fields) setErrors(data.fields);
      throw new Error(data.error || 'No hemos podido procesar el pedido');
    }
    orderRef.current = data;
    return data;
  };

  const finish = (data) => {
    clear();
    router.push(`/pedido/${data.orderId}?${data.demo ? 'demo=1' : `t=${data.accessToken}`}`);
  };

  const submitCash = async (e) => {
    e.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    try { finish(await createOrder()); }
    catch (err) { toast.error(err.message); setBusy(false); }
  };

  const release = async () => {
    const o = orderRef.current;
    orderRef.current = null;
    if (o && !o.demo) await fetch('/api/orders/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.orderId, accessToken: o.accessToken }) }).catch(() => {});
  };

  const paypalOptions = useMemo(() => ({ clientId: PAYPAL_ID, currency: 'EUR', intent: 'capture', locale: 'es_ES' }), []);

  if (!ready) return <div className="wrap min-h-[50vh] py-16" aria-busy />;
  if (!buyable.length) {
    return (
      <section className="wrap flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="h-display text-[clamp(40px,6vw,72px)]">Tu bolsa está vacía</h1>
        <p className="mt-3 text-[17px] text-ink-soft">Añade algo para poder tramitar el pedido.</p>
        <Link href="/buscar" className="btn btn-primary mt-8">Ver la tienda</Link>
      </section>
    );
  }

  return (
    <section className="wrap py-10 sm:py-14">
      <h1 className="h-display text-[clamp(40px,6vw,72px)]">Tramitar pedido</h1>
      <form onSubmit={submitCash} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="space-y-10">
          {/* 1. Entrega */}
          <fieldset>
            <legend className="mb-4 font-display text-[28px] font-semibold">1. Cómo lo quieres</legend>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {Object.entries(methods).filter(([, m]) => m.enabled).map(([k, m]) => (
                <label key={k} className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 transition-[border-color,background-color] duration-150 ${shipping === k ? 'border-ink bg-paper' : 'border-line bg-paper/60 hover:border-ink/50'}`}>
                  <input type="radio" name="shipping" className="sr-only" checked={shipping === k} onChange={() => chooseShipping(k)} />
                  {k === 'delivery' ? <Truck size={22} className="mt-0.5 shrink-0 text-terracotta-deep" /> : <HandCoins size={22} className="mt-0.5 shrink-0 text-terracotta-deep" />}
                  <span>
                    <span className="block text-[16px] font-bold">{m.label} <span className="font-medium text-ink-soft">· {m.cost ? eur(m.cost) : 'Gratis'}</span></span>
                    <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. Datos */}
          <fieldset>
            <legend className="mb-4 font-display text-[28px] font-semibold">2. Tus datos</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Nombre y apellidos" error={errors.fullName} className="sm:col-span-2"><input id="f-fullName" className="field" autoComplete="name" value={f.fullName} onChange={set('fullName')} aria-invalid={!!errors.fullName} /></Field>
              <Field id="email" label="Correo electrónico" error={errors.email}><input id="f-email" type="email" inputMode="email" className="field" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
              <Field id="phone" label="Teléfono" error={errors.phone}><input id="f-phone" type="tel" inputMode="tel" className="field" autoComplete="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone} /></Field>
              {shipping === 'delivery' && (
                <>
                  <Field id="address" label="Dirección" error={errors.address} className="sm:col-span-2"><input id="f-address" className="field" autoComplete="street-address" value={f.address} onChange={set('address')} aria-invalid={!!errors.address} placeholder="Calle, número, piso" /></Field>
                  <Field id="city" label="Ciudad" error={errors.city}><input id="f-city" className="field" autoComplete="address-level2" value={f.city} onChange={set('city')} aria-invalid={!!errors.city} /></Field>
                  <Field id="postalCode" label="Código postal" error={errors.postalCode}><input id="f-postalCode" inputMode="numeric" maxLength={5} className="field" autoComplete="postal-code" value={f.postalCode} onChange={set('postalCode')} aria-invalid={!!errors.postalCode} /></Field>
                </>
              )}
              <Field id="notes" label={shipping === 'meetup' ? 'Cuándo y dónde te viene bien (opcional)' : 'Comentarios (opcional)'} className="sm:col-span-2"><textarea id="f-notes" rows={3} className="field resize-none" value={f.notes} onChange={set('notes')} maxLength={400} /></Field>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.honeypot} onChange={set('honeypot')} className="hidden" aria-hidden />
            </div>
          </fieldset>

          {/* 3. Pago */}
          <fieldset>
            <legend className="mb-4 font-display text-[28px] font-semibold">3. Cómo pagas</legend>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {payments.map((k) => (
                <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-[border-color,background-color] duration-150 ${payment === k ? 'border-ink bg-paper' : 'border-line bg-paper/60 hover:border-ink/50'}`}>
                  <input type="radio" name="payment" className="sr-only" checked={payment === k} onChange={() => setPayment(k)} />
                  {k === 'paypal' ? <CreditCard size={22} className="text-terracotta-deep" /> : <HandCoins size={22} className="text-terracotta-deep" />}
                  <span className="text-[16px] font-bold">{SITE_CONFIG.payments.labels[k]}</span>
                </label>
              ))}
            </div>
            {payment === 'cash' && <p className="mt-3 text-[14px] text-ink-soft">Te escribiremos para quedar. Pagas {eur(total)} en mano cuando lo recibas.</p>}
            {paypalBlocked && <p className="mt-3 rounded-md bg-warn/10 px-4 py-3 text-[14px] font-medium text-ink" role="status">PayPal estará disponible muy pronto. Mientras tanto puedes quedar en persona y pagar en mano.</p>}
          </fieldset>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug">
              <input id="f-terms" type="checkbox" checked={f.terms} onChange={set('terms')} className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-[rgb(var(--c-terracotta-deep))]" aria-invalid={!!errors.terms} />
              <span>He leído y acepto los <Link href="/terminos-y-condiciones" target="_blank" className="underline underline-offset-2">términos y condiciones</Link> y la <Link href="/privacidad" target="_blank" className="underline underline-offset-2">política de privacidad</Link>.</span>
            </label>
            {errors.terms && <p className="err">{errors.terms}</p>}
          </div>
        </div>

        {/* Resumen */}
        <aside className="h-fit rounded-lg border border-line bg-paper p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-[28px] font-semibold">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-line">
            {buyable.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <span className="relative h-[72px] w-[54px] shrink-0 overflow-hidden rounded-md bg-sand">{i.image && <Image src={i.image} alt="" fill sizes="54px" className="object-cover" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{i.name}</span><span className="text-[13px] text-ink-soft">Talla {i.size} · {i.quantity} ud.</span></span>
                <span className="text-[15px] font-semibold tabular-nums">{eur(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="tabular-nums">{eur(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Envío</dt><dd className="tabular-nums">{shippingCost ? eur(shippingCost) : 'Gratis'}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="text-[17px] font-bold">Total</dt><dd className="text-[26px] font-bold tabular-nums">{eur(total)}</dd></div>
            <p className="text-[12px] text-ink-soft">{SITE_CONFIG.legal.taxIncludedText}.</p>
          </dl>

          <div className="mt-6">
            {errors.form && <p className="err mb-3">{errors.form}</p>}
            {payment === 'paypal' && PAYPAL_READY ? (
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 48 }}
                  forceReRender={[total, shipping, buyable.length]}
                  onClick={(_, actions) => (validate() ? actions.resolve() : actions.reject())}
                  createOrder={async () => {
                    try { return (await createOrder()).paypalOrderId; }
                    catch (err) { toast.error(err.message); throw err; }
                  }}
                  onApprove={async (data) => {
                    const o = orderRef.current;
                    const res = await fetch('/api/paypal/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.orderId, accessToken: o.accessToken, paypalOrderId: data.orderID }) });
                    if (!res.ok) { const j = await res.json().catch(() => ({})); toast.error(j.error || 'No hemos podido confirmar el pago'); await release(); return; }
                    finish(o);
                  }}
                  onCancel={async () => { await release(); toast('Pago cancelado. No se ha cobrado nada.'); }}
                  onError={async () => { await release(); }}
                />
              </PayPalScriptProvider>
            ) : (
              <button type="submit" disabled={busy || paypalBlocked} className="btn btn-primary w-full !min-h-[56px] text-[14px]">
                {busy ? 'Enviando…' : 'Confirmar pedido'}
              </button>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-soft"><Lock size={12} /> Tus datos solo se usan para gestionar este pedido.</p>
          </div>
        </aside>
      </form>
    </section>
  );
}

function Field({ id, label, error, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={`f-${id}`} className="label">{label}</label>
      {children}
      {error && <p className="err" id={`e-${id}`}>{error}</p>}
    </div>
  );
}
