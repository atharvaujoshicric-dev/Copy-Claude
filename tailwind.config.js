/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink:       { 950:'#0D0B0A', 900:'#1A1714', 800:'#2C2826', 700:'#3E3A38', 600:'#5A5652' },
        parchment: { 50:'#FAF7F2', 100:'#F2EDE3', 200:'#E8DFD0' },
        gold:      { 400:'#D4A847', 500:'#C49635', 600:'#A67C2A' },
        sage:      { 400:'#7A9E87', 500:'#628A70' },
      },
    },
  },
  plugins: [],
}
