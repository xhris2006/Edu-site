/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core dark palette (inspired by Bookz app images)
        dark: {
          DEFAULT: '#0E0E14',
          50: '#1A1A24',
          100: '#16161F',
          200: '#12121A',
          300: '#0E0E14',
          400: '#0A0A0F',
          500: '#06060A',
        },
        card: {
          DEFAULT: '#1A1A24',
          hover: '#22222E',
          border: '#2A2A38',
        },
        // Primary accent - electric crimson red (from Bookz)
        primary: {
          DEFAULT: '#E63946',
          50: '#FFF0F1',
          100: '#FFCDD0',
          200: '#FF9AA0',
          300: '#FF6670',
          400: '#F03848',
          500: '#E63946',
          600: '#CC2E3A',
          700: '#A8242E',
          800: '#841B24',
          900: '#60131A',
        },
        // Secondary - electric purple
        secondary: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
        // Accent gold (African premium)
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        // Text colors
        text: {
          primary: '#F1F1F5',
          secondary: '#9898A8',
          muted: '#5C5C70',
        },
      },
      fontFamily: {
        sans: ['var(--font-syne)', 'var(--font-inter)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glow-red': 'radial-gradient(circle at center, rgba(230, 57, 70, 0.15) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, #1A1A24 0%, #12121A 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0E0E14 0%, #1A1A24 50%, #0E0E14 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(230, 57, 70, 0.3)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(230, 57, 70, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(230, 57, 70, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
