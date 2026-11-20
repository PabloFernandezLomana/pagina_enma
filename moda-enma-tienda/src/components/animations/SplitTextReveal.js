'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function SplitTextReveal({
  text = '',
  className = '',
  delay = 0.1,
  duration = 0.9,
  stagger = 0.03,
  tag: Tag = 'h1'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const letters = containerRef.current.querySelectorAll('.split-char');
    if (!letters || letters.length === 0) return;

    gsap.fromTo(
      letters,
      {
        opacity: 0,
        y: 35,
        rotateX: -45,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: duration,
        delay: delay,
        stagger: stagger,
        ease: 'power3.out',
      }
    );
  }, [text, delay, duration, stagger]);

  const words = text.split(' ');

  return (
    <Tag ref={containerRef} className={`inline-block overflow-hidden ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, cIdx) => (
            <span
              key={cIdx}
              className="split-char inline-block opacity-0 transform-gpu"
              style={{ willChange: 'transform, opacity' }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
