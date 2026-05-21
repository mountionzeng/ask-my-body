import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', "ui-serif", "Georgia", "serif"],
        kai: ['"LXGW WenKai TC"', '"Noto Serif SC"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: {
          50: "#faf8f3",
          100: "#f7f3eb",
          200: "#e8e2d6",
          300: "#d5cfc8",
          400: "#8a8078",
          500: "#6a6058",
          600: "#4a4238",
          700: "#3a3028",
          800: "#2a2520",
          900: "#1c1917",
        },
        plum: {
          100: "#f5dde0",
          200: "#f0c4c8",
          300: "#e8a0a8",
          400: "#c08088",
          500: "#b85060",
          600: "#804048",
          700: "#6b3a40",
          800: "#4a2528",
        },
        bamboo: {
          100: "#d4e4d0",
          200: "#a8c4a0",
          300: "#8aa482",
          400: "#6e8a66",
          500: "#3a4a32",
        },
        night: {
          bg: "#ece5d8",
          100: "#f8f2e8",
          200: "#e8dfc8",
          300: "#b8a890",
          400: "#7a6e64",
          500: "#5a4e44",
          600: "#3a3028",
        },
      },
      letterSpacing: {
        widest: "0.2em",
        super: "0.32em",
      },
    },
  },
  plugins: [],
};

export default config;
