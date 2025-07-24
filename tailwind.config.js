/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tea: {
          25: '#fafdf8',
          50: '#f2f7f0',
          100: '#e5f2e0',
          200: '#d0e8c7',
          300: '#a8d49a',
          400: '#7db86d',
          500: '#5a9b47',
          600: '#4a7c38',
          700: '#3c6230',
          800: '#2f4f28',
          900: '#1e3319',
        },
        forest: {
          50: '#f7f7f4',
          100: '#efeeeb',
          200: '#dcd9d0',
          300: '#b8b3a3',
          400: '#9a9284',
          500: '#7d7467',
          600: '#6b6255',
          700: '#5a5248',
          800: '#4a453e',
          900: '#3d3a35',
        },
        sage: {
          50: '#f6f7f4',
          100: '#eef0eb',
          200: '#dde2d6',
          300: '#c3ccb8',
          400: '#a4af95',
          500: '#869275',
          600: '#6d7660',
          700: '#5a614f',
          800: '#4a5043',
          900: '#3e4238',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}