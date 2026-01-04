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
        // 红酒主题色彩
        primary: {
          50: '#faf5f5',
          100: '#f0e6e6',
          200: '#e1cdcd',
          300: '#cba7a7',
          400: '#ad7a7a',
          500: '#8b5555',
          600: '#722f37', // 勃艮第红 Burgundy
          700: '#5a252c',
          800: '#4a2025',
          900: '#3e1d21',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#c9a227', // 香槟金 Champagne Gold
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#1e4d2b', // 酒瓶绿 Bottle Green
          700: '#166534',
          800: '#14532d',
          900: '#14532d',
        },
        background: {
          light: '#faf7f2', // 米白 Cream
          dark: '#1a1412', // 深酒色 Dark Wine
        },
        surface: {
          light: '#ffffff',
          dark: '#2d2420',
        },
        text: {
          primary: {
            light: '#2c1810',
            dark: '#f5ede6',
          },
          secondary: {
            light: '#6b5b4f',
            dark: '#a89585',
          },
        },
        border: {
          light: '#e8dfd5',
          dark: '#3d3530',
        },
        success: '#2d7d46',
        warning: '#d4a520',
        error: '#b91c1c',
        info: '#0369a1',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
}
