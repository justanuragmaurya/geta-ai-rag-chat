import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFBF5',
        ivory: '#FFF5E9',
        parchment: '#FFEED8',
        saffron: {
          DEFAULT: '#E8652B',
          light: '#F4945E',
          dark: '#C44D16',
        },
        gold: {
          DEFAULT: '#C4952A',
          light: '#DEBA5C',
          dark: '#8B6914',
        },
        'deep-brown': '#2D1810',
        'warm-brown': '#6B4C3B',
        muted: '#9B8574',
        border: '#E8D5C0',
        'krishna-blue': '#1B4D8C',
        'lotus-pink': '#D4567A',
      },
      fontFamily: {
        yatra: ['var(--font-yatra)', 'serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 1px 3px rgba(45, 24, 16, 0.06), 0 1px 2px rgba(45, 24, 16, 0.04)',
        'warm-md': '0 4px 12px rgba(45, 24, 16, 0.08)',
        'warm-lg': '0 10px 30px rgba(45, 24, 16, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
