/** moda-enma-tienda/tailwind.config.js — los colores salen de tokens.css (fuente única) */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: c('cream'), paper: c('paper'), sand: c('sand'), line: c('line'),
        ink: { DEFAULT: c('ink'), soft: c('ink-soft') },
        terracotta: { DEFAULT: c('terracotta'), deep: c('terracotta-deep'), soft: c('terracotta-soft') },
        tint: { mujer: c('mujer'), hombre: c('hombre'), ninos: c('ninos'), deporte: c('deporte'), accesorios: c('accesorios') },
        ok: c('ok'), warn: c('warn'), bad: c('bad'),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)' },
      boxShadow: { soft: 'var(--shadow-soft)', lift: 'var(--shadow-lift)' },
      transitionTimingFunction: { out: 'var(--ease-out)', 'in-out': 'var(--ease-in-out)' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: { marquee: 'marquee 38s linear infinite', float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
