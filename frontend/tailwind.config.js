/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Refined neutral + single indigo accent (Linear/Stripe/Vercel register).
        // Kept the `navy`/`teal` token names so existing utilities remap cleanly.
        navy: {
          DEFAULT: "#18181b", // primary ink / dark fills
          50: "#fafafa",
          100: "#f4f4f5",
          600: "#26262b",
          700: "#18181b",
          800: "#131316", // dark card
          900: "#0a0a0a", // dark app bg
        },
        teal: {
          DEFAULT: "#4f46e5", // accent (indigo-600)
          light: "#818cf8",
          dark: "#4338ca",
        },
        ink: "#171717",
        line: "#ececee",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "10px",
        md: "7px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,17,20,0.04)",
        pop: "0 4px 20px -4px rgba(16,17,20,0.12), 0 1px 3px rgba(16,17,20,0.06)",
      },
      letterSpacing: {
        tightish: "-0.011em",
      },
    },
  },
  plugins: [],
};
