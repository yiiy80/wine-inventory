/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#722F37', // Burgundy
          light: '#8B3A42',
          dark: '#5A252C',
        },
        secondary: {
          DEFAULT: '#C9A227', // Gold
        },
        accent: {
          DEFAULT: '#1E4D2B', // Forest Green
        },
        cream: '#FAF7F2',
        'dark-wine': '#1A1412',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
