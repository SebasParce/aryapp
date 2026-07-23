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
          blue: "#2563EB",
          "blue-light": "#EFF6FF",
          "blue-soft": "#DBEAFE",
          ink: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
