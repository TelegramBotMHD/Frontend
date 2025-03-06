/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}" // Sucht in allen JSX-Dateien nach Tailwind-Klassen
  ],
  theme: {
    extend: {}, // Hier können wir später Anpassungen machen
  },
  darkMode: "class", // Dark-Mode aktivieren
  plugins: [],
};
