/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink:     "var(--ink)",
        ember:   "var(--ember)",
        ocean:   "var(--ocean)",
        sage:    "var(--sage)",
        gold:    "var(--gold)",
      },
      fontFamily: {
        sans:  ["DM Sans", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Bricolage Grotesque", "Cambria", "Georgia", "serif"],
        mono:  ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        panel: "0 8px 32px -16px rgba(15,25,35,0.18)",
      },
    },
  },
  plugins: [],
};

