'use client';
// moda-enma-tienda/src/components/ui/Reveal.js
// Aparece al entrar en pantalla (una vez). Solo transform + opacity. Sin JS, todo es visible.
import { useEffect, useRef } from 'react';

let observer;
function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); observer.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  return observer;
}

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const o = getObserver();
    if (!el) return;
    if (!o) { el.classList.add('is-in'); return; }
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
