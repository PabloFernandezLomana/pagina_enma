// moda-enma-tienda/src/components/legal/LegalPage.js
import { SITE_CONFIG, hasValue } from '@/site.config';

/** Dato del titular: se muestra tal cual o un aviso visible si aún falta. */
export function Ph({ value, label }) {
  return hasValue(value)
    ? <strong>{value}</strong>
    : <mark className="rounded bg-warn/20 px-1.5 py-0.5 font-semibold text-ink">[{label}: pendiente de completar]</mark>;
}

export function owner() {
  const b = SITE_CONFIG.brand;
  return { name: <Ph value={b.legalName} label="Nombre o razón social del titular" />, nif: <Ph value={b.nif} label="NIF" />, address: <Ph value={b.address} label="Domicilio" />, email: <Ph value={b.email} label="Correo de contacto" /> };
}

export const H = ({ children }) => <h2 className="mt-10 font-display text-[28px] font-semibold leading-tight">{children}</h2>;
export const P = ({ children }) => <p className="mt-3 text-[16px] leading-relaxed text-ink/85">{children}</p>;
export const UL = ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[16px] leading-relaxed text-ink/85">{children}</ul>;

export default function LegalPage({ title, intro, children }) {
  return (
    <article className="wrap max-w-[800px] py-12 sm:py-16">
      <p className="eyebrow">Información legal</p>
      <h1 className="h-display mt-2 text-[clamp(40px,6vw,68px)]">{title}</h1>
      {intro && <p className="mt-4 text-[17px] text-ink-soft">{intro}</p>}
      <p className="mt-2 text-[13px] text-ink-soft">Versión {SITE_CONFIG.legal.policyVersion}</p>
      {children}
    </article>
  );
}
