import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        makola: {
          orange: "#E67E22",
          "orange-dark": "#D35400",
          green: "#1A5D1A",
          "green-light": "#27AE60",
          cream: "#FDF6F0",
          sand: "#F5EDE4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
