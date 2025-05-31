/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F02CC', // Azul Principal
          light: '#5F50E5', // Azul Claro
          dark: '#1D0158', // Azul Oscuro
        },
        white: '#FFFFFF',
        green: '#39DFB2',
        'yellow-star': '#FFB600',
      },
      boxShadow: {
        yuppie: '0 4px 14px 0 rgba(47, 2, 204, 0.25)',
      },
      backgroundImage: {
        'gradient-yuppie': 'linear-gradient(145deg, #5F50E5 0%, #2F02CC 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
};
