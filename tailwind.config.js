// tailwind.config.cjs または tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#EFE7D1",
        elfGreen: "#1E392A",
        hobbitBrown: "#7A5E3A",
        hobbitGreen: "#698C4E",
        elvenGold: "#C6A667",
        textdark: "#1F130A",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
