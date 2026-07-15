import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#eef1f7", 100: "#d7deec", 600: "#1e3763", 700: "#152a4d", 900: "#0b1730" },
        shu: { 50: "#fdecea", 100: "#fad3ce", 500: "#c8402b", 600: "#a83220" },
        sumi: { 50: "#f7f7f8", 100: "#eceef0", 400: "#7b828d", 600: "#4b515a", 900: "#1f2226" },
      },
      fontFamily: { sans: ["'Noto Sans JP'", "'Inter'", "system-ui", "sans-serif"] },
      borderRadius: { xl: "0.875rem" },
    },
  },
  plugins: [],
};
export default config;
