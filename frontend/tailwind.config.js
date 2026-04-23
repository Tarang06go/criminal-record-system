/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0B1220",
        surface: "#111827",
        elevated:"#1F2937",
        blue:    "#3B82F6",
        green:   "#10B981",
        orange:  "#F59E0B",
        red:     "#EF4444",
      },
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
        mono:    ["IBM Plex Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};