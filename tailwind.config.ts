import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#ff9e001a",
        input: "#ff9e001a",
        ring: "#ff9e00",
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#ff9e00",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#fbbf24",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#ff9e00",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
