/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#2c6e9e',
        'medical-light': '#e8f4fc',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}