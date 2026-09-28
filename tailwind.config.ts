import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0a0918',
          900: '#100e24',
          800: '#171532',
          700: '#211d42',
          600: '#2c2755',
          500: '#3a3370',
        },
        parchment: '#EDEAF6',
        mist: '#A7A2C4',
        ember: {
          400: '#F7CB4D',
          500: '#F2B705',
          600: '#D69A00',
        },
        arcane: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7440E8',
        },
        verdant: {
          400: '#4ADE80',
          500: '#34D399',
          600: '#1FAE7E',
        },
        ember_red: {
          400: '#FB7185',
          500: '#F0475D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'rune-grid':
          'radial-gradient(circle at 1px 1px, rgba(167,138,250,0.08) 1px, transparent 0)',
      },
      boxShadow: {
        node: '0 0 0 1px rgba(167,138,250,0.25), 0 8px 24px -8px rgba(0,0,0,0.6)',
        glow: '0 0 24px -4px rgba(139,92,246,0.55)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        popIn: 'popIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
