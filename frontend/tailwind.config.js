/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fff7',
          100: '#b3ffe4',
          200: '#80ffd1',
          300: '#4dffbe',
          400: '#1affab',
          500: '#00b386',
          600: '#009e75',
          700: '#008964',
          800: '#007453',
          900: '#005f42',
        },
        secondary: {
          50: '#e6f3ff',
          100: '#b3dbff',
          200: '#80c3ff',
          300: '#4dabff',
          400: '#1a93ff',
          500: '#0078FF',
          600: '#0066cc',
          700: '#005599',
          800: '#004466',
          900: '#003333',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 16px rgba(0,0,0,0.1)',
        'medium': '0 6px 24px rgba(0,0,0,0.15)',
        'hard': '0 8px 32px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
} 