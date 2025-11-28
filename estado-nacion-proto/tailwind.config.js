/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        'navy': {
          900: '#0a1128',
          800: '#0f1a3d',
          700: '#152041',
        },
        'glass': {
          dark: 'rgba(15, 23, 42, 0.6)',
          light: 'rgba(30, 41, 59, 0.4)',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.4)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
