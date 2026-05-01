import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#df8097",
        secondary: "#be7ab8",
        tertiary: "#8262b6",
        title: "#393738",
        text: "#646162",
        buttons: "#8c4054",
        neutral: "#e7e1e2",
        background: "#fffafa",
      },
      fontFamily: {
        title: ["var(--font-poppins)", "Poppins", "sans-serif"],
        text: ["var(--font-inter)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        maia: "1rem",
        "maia-lg": "1.5rem",
        "maia-xl": "2rem",
      },
      boxShadow: {
        soft: "0 16px 48px rgb(57 55 56 / 0.12)",
        card: "0 12px 30px rgb(140 64 84 / 0.14)",
        button: "0 10px 20px rgb(140 64 84 / 0.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
