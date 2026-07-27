import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arya: {
          // Paleta de marca Arya: teal principal + acento naranja
          teal: "#0E9B8E",
          "teal-dark": "#17564F",
          "teal-light": "#E6F5F3",
          "teal-soft": "#C2E8E3",
          orange: "#E2953C",
          "orange-light": "#FDF2E4",
          ink: "#12312D",
          muted: "#64807C",
          border: "#DCE7E5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
