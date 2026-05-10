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
        // ── Palette resserrée (60-30-10), warm-neutral, identité wine artisanale.
        background: "#FAFAF7",   // off-white warm — surface dominante (60%)
        paper: "#F4F2EC",        // surface élevée (cards rares, sections de rupture)
        surface: "#F4F2EC",      // alias pour compat existant
        cream: {                 // alias pour compat existant
          DEFAULT: "#F4F2EC",
          deep: "#ECE8DD",
        },
        foreground: "#0F0F0E",   // near-black warm (30%)
        muted: "#5C5B57",        // mid-gray warm pour body secondaire
        subtle: "#A3A29C",       // mid-gray clair (placeholder, hint)
        border: "#E5E3DD",       // hairline warm
        accent: {                // vert conformité — usage rare (puce footer)
          DEFAULT: "#16A34A",
          hover: "#15803D",
        },
        wine: {                  // accent unique — utilisé comme rature
          DEFAULT: "#5C1A2B",
          deep: "#5C1A2B",
          soft: "#5C1A2B",
        },
        success: "#16A34A",      // alias pour compat
        error: "#9F2230",        // wine-shifted, pas un rouge SaaS
        ink: "#0F0F0E",          // alias pour compat
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: [
          "var(--font-fraunces)",
          "Fraunces",
          "Cormorant Garamond",
          "Georgia",
          "serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.02em",
        display: "-0.04em",
        wider: "0.05em",
        widest: "0.2em",
        cap: "0.25em",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        // Quasi pas d'élévation. Hairline > shadow.
        subtle: "0 1px 2px 0 rgba(15, 15, 14, 0.04)",
        card: "0 1px 2px 0 rgba(15, 15, 14, 0.04)",
        // shadow-wine retiré — éliminé avec hover-translate cards
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
        // float / shine / marquee retirés — incohérents avec direction
      },
      animation: {
        "fade-in": "fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "accordion-down": "accordion-down 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        prose: "65ch",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
