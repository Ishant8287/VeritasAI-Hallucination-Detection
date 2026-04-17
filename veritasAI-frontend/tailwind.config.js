/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0A0A0A',
        surface: '#111111',
        'surface-elevated': '#1A1A1A',
        'surface-glass': 'rgba(255, 255, 255, 0.02)',
        accent: '#7C3AED',
        'accent-hover': '#6D28D9',
        'accent-muted': 'rgba(124, 58, 237, 0.12)',
        'accent-secondary': '#5B21B6',
        'text-primary': '#EDEDED',
        'text-secondary': '#A1A1AA',
        'text-tertiary': '#71717A',
        verified: '#10B981',
        'verdict-false': '#EF4444',
        unverifiable: '#F59E0B',
        border: '#1F1F1F',
        'border-accent': 'rgba(124, 58, 237, 0.3)',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
}
