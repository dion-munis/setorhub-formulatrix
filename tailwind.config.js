/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        paper: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        'text-secondary': '#6B7280',
        accent: {
          DEFAULT: '#111827',
          soft: '#F3F4F6',
          hover: '#1F2937',
        },
        sidebar: {
          bg: '#FFFFFF',
          border: '#E5E7EB',
          hover: '#F3F4F6',
          active: '#F3F4F6',
          'active-text': '#111827',
        },
        stats: {
          'trend-up': '#111827',
          'trend-up-bg': '#F3F4F6',
          'trend-down': '#6B7280',
          'trend-down-bg': '#F3F4F6',
          'trend-neutral': '#9CA3AF',
          'trend-neutral-bg': '#F9FAFB',
        },
        status: {
          progress: '#111827',
          'progress-bg': '#F3F4F6',
          done: '#111827',
          'done-bg': '#F3F4F6',
          review: '#6B7280',
          'review-bg': '#F3F4F6',
          delayed: '#9CA3AF',
          'delayed-bg': '#F9FAFB',
          cancelled: '#D1D5DB',
          'cancelled-bg': '#F9FAFB',
          revise: '#6B7280',
          'revise-bg': '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"SF Mono"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'panel': '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
        'panel-lg': '0 25px 50px -12px rgba(0,0,0,0.15)',
        'sidebar': '1px 0 0 0 rgba(0,0,0,0.05)',
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
