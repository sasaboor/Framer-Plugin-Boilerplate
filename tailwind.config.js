/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", "[data-framer-theme='dark']"],
  theme: {
    extend: {
      height: {
        7.5: "1.875rem",
      },
      width: {
        7.5: "1.875rem",
      },
      spacing: {
        7.5: "1.875rem",
      },
      gap: {
        7.5: "1.875rem",
      },
      colors: {
        framer: {
          blue: "#0099FF",
        },
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
  plugins: [],
};
