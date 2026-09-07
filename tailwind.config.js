/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        signature: ["Caveat", "cursive"],
      },
      // Brand tokens (also reachable via Tailwind's default slate/indigo/emerald scales,
      // since #1e293b, #4f46e5 and #10b981 are literally slate-800, indigo-600 and emerald-500):
      colors: {
        brand: {
          ink: "#1e293b", // Deep Slate — primary text
          accent: "#4f46e5", // Indigo — buttons / brand accents
          success: "#10b981", // Emerald — success / paid states
        },
      },
    },
  },
  plugins: [],
};
