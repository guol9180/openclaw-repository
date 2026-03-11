/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e1a',
          darker: '#060912',
          blue: '#00d4ff',
          'blue-dim': '#0088aa',
          green: '#00ff88',
          red: '#ff3366',
          purple: '#8844ff',
          orange: '#ff8800'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'data-flow': 'data-flow 1s linear infinite',
        'scroll': 'scroll 0.5s linear'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.3)' }
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-20px)' }
        }
      }
    }
  },
  plugins: []
};
