/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        'customfill' : 'rgba(13, 40, 69, 1)',
        'whitetrspnt' : 'rgba(219, 219, 219, 0.2)',
        'bluetrspnt' : 'rgba(219, 219, 219, 0.3)',
        'hrcolor': 'rgba(217, 217, 217, 0.6)'
      },
      fontFamily:{
        custom: ['sans-serif'],
        open:['Open Sans'],
        balsamiq: ['Balsamiq Sans'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
