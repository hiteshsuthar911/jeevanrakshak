/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rescue Blue — sky/teal professional palette
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Teal accent
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Deep navy backgrounds
        dark: {
          50:  '#0f172a',
          100: '#0d1526',
          200: '#0a1020',
          300: '#070c18',
          400: '#04080f',
          500: '#020408',
        },
        surface: {
          100: '#0f172a',
          200: '#1e293b',
          300: '#162032',
          400: '#1a2844',
        },
        accent:  '#0ea5e9',
        success: '#22c55e',
        warning: '#f59e0b',
        info:    '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
        'ping-slow':  'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.7)' },
          '50%':       { boxShadow: '0 0 0 20px rgba(14, 165, 233, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { textShadow: '0 0 5px #0ea5e9, 0 0 10px #0ea5e9' },
          to:   { textShadow: '0 0 10px #0284c7, 0 0 30px #0284c7, 0 0 50px #0284c7' },
        },
        slideIn: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',      opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
