import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2563EB',
        'brand-hover': '#1D4ED8',
        'brand-soft': '#EFF6FF',
        danger: 'oklch(0.58 0.21 25)',
        'danger-soft': 'oklch(0.96 0.04 25)',
        success: 'oklch(0.62 0.15 155)',
        'success-soft': 'oklch(0.95 0.04 155)',
        amber: 'oklch(0.78 0.13 75)',
        ink: {
          1: '#111111',
          2: '#374151',
          3: '#666666',
          4: '#9CA3AF',
          5: '#E5E7EB',
        },
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '32px',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        'slide-up': 'slideUp 260ms ease-out',
        'shrink-8': 'shrink 8s linear forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
