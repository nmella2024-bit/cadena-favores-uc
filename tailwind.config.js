/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uc-blue': '#0033A0',
        'uc-blue-light': '#0051C3',
        'uc-blue-dark': '#002270',
        'mint': '#00BFA6',
        'mint-light': '#4DDCC7',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
