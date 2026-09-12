import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        dark: "var(--color-dark)",
        accent: "var(--color-accent)",
        "border-soft": "var(--color-border-soft)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        brand: {
          bg: "var(--color-background)",
          dark: "var(--color-dark)",
          accent: "var(--color-accent)",
          terracotta: "var(--color-accent)",
          border: "var(--color-border-soft)",
          soft: "#EDE5D8",
          subtle: "#FAF8F5",
          muted: "var(--color-text-secondary)",
          hoverDark: "#2B2217",
          hoverAccent: "#9E5524",
        },
        card: {
          DEFAULT: "#FFFFFF",
          warm: "#FBF9F5",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(31, 24, 16, 0.05)',
        'card': '0 2px 12px -1px rgba(31, 24, 16, 0.04), 0 1px 3px 0 rgba(31, 24, 16, 0.02)',
        'elevated': '0 10px 30px -4px rgba(31, 24, 16, 0.08), 0 4px 6px -2px rgba(31, 24, 16, 0.03)',
      }
    },
  },
  plugins: [],
};
export default config;
