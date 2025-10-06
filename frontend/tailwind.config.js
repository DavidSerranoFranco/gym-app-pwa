// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ¡Importante: aquí buscará las clases!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}