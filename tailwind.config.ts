// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F8F9FA",
        foreground: "#111827",
        muted: "#6B7280",
        border: "#E5E7EB",
        accent: {
          DEFAULT: "#16A34A",
          hover: "#15803D",
        },
        success: "#16A34A",
        error: "#DC2626",
        ink: "#111827",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        widest: "0.2em",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(17, 24, 39, 0.04)",
        card: "0 1px 3px 0 rgba(17, 24, 39, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
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
        "fade-in": "fade-in 240ms ease-out both",
        "slide-up": "slide-up 280ms ease-out both",
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 220ms ease-out",
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
