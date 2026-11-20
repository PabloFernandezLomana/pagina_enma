/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#fcfbf9',
          card: '#ffffff',
          sand: '#f4f0e8',
          pill: '#ece7de',
          border: '#e7e2d7',
          dark: '#1c1917',
          muted: '#78716c',
        },
        brand: {
          terracotta: '#c86d51',
          terracottaDark: '#a9553c',
          olive: '#747c5d',
          gold: '#c5a880',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'Didot', 'Bodoni MT', 'serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        editorial: '0.15em',
      },
    },
  },
  plugins: [],
};
