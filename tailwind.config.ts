
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B5CF6", // Changed to Vibrant Purple
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F172A",
        },
        accent: {
          DEFAULT: "#F97316", // Bright Orange as accent
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.8)",
          foreground: "#0F172A",
        },
        health: {
          blue: "#0EA5E9",
          green: "#10B981",
          red: "#EF4444",
          yellow: "#F59E0B",
          purple: "#8B5CF6",
          pink: "#EC4899",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
