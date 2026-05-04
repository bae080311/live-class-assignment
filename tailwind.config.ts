import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: 'oklch(0.52 0.18 268)',
        'brand-soft': 'oklch(0.95 0.05 268)',
        danger: 'oklch(0.58 0.21 25)',
        'danger-soft': 'oklch(0.96 0.04 25)',
        success: 'oklch(0.62 0.15 155)',
        'success-soft': 'oklch(0.95 0.04 155)',
        amber: 'oklch(0.78 0.13 75)',
        ink: {
          1: 'oklch(0.14 0.01 265)',
          2: 'oklch(0.32 0.01 265)',
          3: 'oklch(0.52 0.01 265)',
          4: 'oklch(0.72 0.01 265)',
          5: 'oklch(0.90 0.01 265)',
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
    },
  },
  plugins: [],
} satisfies Config
