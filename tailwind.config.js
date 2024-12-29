/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  
    "./src/**/*.html",             
    "./popup/**/*.{js,jsx,html}", 
  ],
  theme: {
    extend: {
      // Custom colors for our extension
      colors: {
        'warning-red': '#ff0000',
        'guilt-red': '#8b0000',
      },
      // Custom animations
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'dramatic-fade': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
  // Disable hover effects on mobile
  future: {
    hoverOnlyWhenSupported: true,
  },
 }