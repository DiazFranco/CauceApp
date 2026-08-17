/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cauce: {
          azul: "#0A192F",
          cian: "#00B4D8",
          cianOscuro: "#0096b4",
          verde: "#10B981",
          hielo: "#F8FAFC",
          coral: "#F43F5E",
          coralOscuro: "#d62d50",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};