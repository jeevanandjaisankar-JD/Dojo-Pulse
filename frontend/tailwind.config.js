/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        kalvium: {
          red: '#e11d48',
          dark: '#0f172a',
          slate: '#1e293b',
          accent: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
