'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ScrollReveal({
  children,
  className = '',
  y = 25,
  duration = 0.8,
  delay = 0,
  stagger = 0.05,
  threshold = 0.1
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = stagger > 0 && el.children.length > 0 ? Array.from(el.children) : el;
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: duration,
              delay: delay,
              stagger: stagger,
              ease: 'power2.out',
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    const targets = stagger > 0 && el.children.length > 0 ? Array.from(el.children) : el;
    gsap.set(targets, { opacity: 0.1, y: y });

    observer.observe(el);

    return () => observer.disconnect();
  }, [y, duration, delay, stagger, threshold]);

  return (
    <div ref={elementRef} className={`transition-opacity ${className}`}>
      {children}
    </div>
  );
}
