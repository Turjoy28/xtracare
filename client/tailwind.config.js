const { blackA, violet } = require("@radix-ui/colors");
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    keyframes: {
      slideDown: {
        "0%": { transform: "translateY(-100%)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      slideUp: {
        "0%": { transform: "translateY(0)", opacity: "1" },
        "100%": { transform: "translateY(-100%)", opacity: "0" },
      },
    },
    animation: {
      slideDown: "slideDown 0.5s ease-in-out forwards",
      slideUp: "slideUp 0.5s ease-in-out forwards",
    },
    container: {
      // you can configure the container to be centered
      center: true,

      // or have default horizontal padding
      padding: {
        DEFAULT: "1rem",
        xs: "1rem",
        sm: "2rem",
        lg: "1rem",
        xl: "1rem",
        "2xl": "1rem",
      },

      // default breakpoints but with 40px removed
      screens: {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      fontSize: {
        head: "30px",
        banhead: "3.5rem",
        parahead: "1rem",
        para: "0.875rem",
      },
      maxWidth: {
        "8xl": "1400px",
      },
      fontFamily: {
        inter: ["'Google Sans'", "'Hind Siliguri'", "sans-serif"],
      },
      colors: {
        primary: "#ff8650",
        secendary: "#EF4934",
        danger: "#173443",
        bancolor: "#FEF7F7",
        textgray: "#7C6D65",
        texthead: "#161619",
        paracolor: "#7c6e65",
        textgray: "#beb4b4",
        border: "#eae8e4",
        inputbg: "#F6F5F3",
        bestdealbg: "#fff6f6",
        customRed: "#43A2CC",
        ...blackA,
        ...violet,
      },
      backgroundImage: {
        banner: "url('./src/assets/banner/bgbanner.jpg')",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
