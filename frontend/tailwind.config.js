/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10243c",
        parchment: "#fffaf4",
        sand: "#efe2d0",
        ember: "#d96c47",
        ocean: "#1d3858",
        sage: "#5f8676",
        gold: "#c39143"
      },
      boxShadow: {
        panel: "0 24px 70px -36px rgba(16, 36, 60, 0.45)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

