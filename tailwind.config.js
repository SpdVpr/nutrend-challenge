/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e30613',
        secondary: '#1a1a1a',
        accent: '#ff6b35',
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8f8f8',
        },
        success: '#00b894',
        text: {
          primary: '#1a1a1a',
          secondary: '#666666',
        },
        border: '#e5e5e5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

