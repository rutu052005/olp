/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#111827',
        ocean: '#0F766E',
        coral: '#F97316',
        iris: '#7C3AED',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(15, 118, 110, 0.22)',
        premium: '0 18px 55px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
