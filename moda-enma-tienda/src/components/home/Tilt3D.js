'use client';
// moda-enma-tienda/src/components/home/Tilt3D.js
// Un objeto que gira en 3D siguiendo el puntero (en móvil se mece solo, despacio).
import { useEffect, useRef } from 'react';

export default function Tilt3D({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let raf, t0 = performance.now(), tx = 0, ty = 0, cx = 0, cy = 0, hovering = false;
    const loop = (now) => {
      if (!fine || !hovering) { const s = (now - t0) / 1000; tx = Math.sin(s * 0.7) * 10; ty = Math.cos(s * 0.55) * 4; }
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      el.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => { const r = el.parentElement.getBoundingClientRect(); hovering = true; tx = ((e.clientX - r.left) / r.width - 0.5) * 26; ty = -((e.clientY - r.top) / r.height - 0.5) * 18; };
    const leave = () => { hovering = false; t0 = performance.now(); };
    const parent = el.parentElement;
    parent.addEventListener('pointermove', move); parent.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', leave); };
  }, []);
  return (
    <div className={`[perspective:1100px] ${className}`}>
      <div ref={ref} className="h-full w-full [transform-style:preserve-3d] will-change-transform">{children}</div>
    </div>
  );
}
