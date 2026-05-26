import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fdfbf7",
          100: "#f8f4ec",
          200: "#efe6d6",
          300: "#e2d4bc",
          400: "#d4c4a8",
        },
        ink: {
          600: "#5c4f3f",
          700: "#3d3429",
          800: "#2c2419",
          900: "#1f1812",
          950: "#14100c",
        },
        wine: {
          600: "#7a3d4d",
          700: "#5c2e3a",
          800: "#4a2530",
          900: "#3a1c26",
          950: "#2a1219",
        },
        gold: {
          400: "#e2c88a",
          500: "#d4b87a",
          600: "#c9a55c",
          700: "#b8923f",
          800: "#9a7a32",
        },
        /* legacy alias — maps to new palette in components */
        brand: {
          50: "#fdfbf7",
          100: "#f8f4ec",
          200: "#efe6d6",
          300: "#e2d4bc",
          400: "#d4c4a8",
          500: "#9a7a32",
          600: "#7a3d4d",
          700: "#5c2e3a",
          800: "#4a2530",
          900: "#3a1c26",
          950: "#2a1219",
        },
      },
      fontFamily: {
        serif: ["var(--font-literata)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "var(--font-literata)", "Georgia", "serif"],
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        manuscript: "0 1px 2px rgba(42, 18, 25, 0.06), 0 8px 24px rgba(42, 18, 25, 0.08)",
        "manuscript-lg": "0 4px 12px rgba(42, 18, 25, 0.1), 0 16px 40px rgba(42, 18, 25, 0.12)",
      },
      backgroundImage: {
        parchment: `
          radial-gradient(ellipse 120% 80% at 50% -20%, rgba(201, 165, 92, 0.12), transparent 50%),
          radial-gradient(ellipse 80% 50% at 100% 50%, rgba(92, 46, 58, 0.04), transparent 45%),
          linear-gradient(180deg, #f8f4ec 0%, #efe6d6 100%)
        `,
      },
    },
  },
  plugins: [typography],
};

export default config;
