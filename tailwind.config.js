/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dynamics: {
          blue: '#0078D4',
          purple: '#8764B8',
          green: '#107C10',
          orange: '#D05F0A',
          dark: '#1B1B1F',
          light: '#F3F2F1',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
