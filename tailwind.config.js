/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#101826',
          light: '#1B2740',
          soft: '#2C3A57',
        },
        paper: '#FAF8F4',
        stone: '#F1EDE4',
        slate: {
          DEFAULT: '#5B6472',
          light: '#667085',
        },
        brass: {
          DEFAULT: '#B8873B',
          light: '#D9AE6C',
          dark: '#8F6A2C',
        },
        line: '#E3DFD6',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      maxWidth: {
        content: '1240px',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ticker: 'ticker 42s linear infinite',
        'fade-up': 'fade-up 500ms ease-out both',
      },
    },
  },
  plugins: [],
}
