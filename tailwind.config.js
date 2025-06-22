/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      strokeWidth: {
        2: '2',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease forwards',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        'fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(4px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      }
    },
  },
  plugins: [],
}