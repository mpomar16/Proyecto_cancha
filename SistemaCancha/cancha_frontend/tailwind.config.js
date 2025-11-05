/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "negro-950": "#000",
        "azul-950": "#0F2634",
        "azul-900": "#224457",
        "azul-850": "#235067",
        "blanco-50": "#ffffff",
        "verde-700": "#05904f",
        "verde-600": "#01cd6c",
        "verde-500": "#0add79",
        "gris-300": "#bdbdbd",
        "gris-200": "#dcdcdc",
        "gris-100": "#efefef",
        "gris-50": "#fbfbfb",
        "rojo-700": "#b01d1d",
        "rojo-600": "#da2828",
        "rojo-500": "#ed4646"
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
