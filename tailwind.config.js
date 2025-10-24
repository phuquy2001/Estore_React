/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B5FFF',
        'primary-600': '#094FCC',
        secondary: '#FF7A59',
        muted: '#6B7280',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
      },
      boxShadow: {
        default: '0 6px 24px rgba(2,6,23,0.08)',
      }
    },
  },
  plugins: [],
}
