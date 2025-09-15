/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d7a53",
          dark: "#0f5132"
        }
      },
      borderRadius: {
        '4xl': "2rem"
      }
    },
  },
  plugins: [],
};
