/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
        },
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        border: {
          subtle: 'var(--border-subtle)',
          hover: 'var(--border-hover)',
          focus: 'var(--border-focus)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          deep: 'var(--accent-deep)',
          violet: 'var(--accent-violet)',
          subtle: 'var(--accent-subtle)',
          text: 'var(--accent-text)',
        },
        coral: {
          DEFAULT: 'var(--color-coral)',
          subtle: 'var(--color-coral-subtle)',
          text: 'var(--color-coral-text)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          subtle: 'var(--color-gold-subtle)',
          text: 'var(--color-gold-text)',
        },
        mint: {
          DEFAULT: 'var(--color-mint)',
          subtle: 'var(--color-mint-subtle)',
          text: 'var(--color-mint-text)',
        },
        sky: {
          DEFAULT: 'var(--color-sky)',
          subtle: 'var(--color-sky-subtle)',
          text: 'var(--color-sky-text)',
        },
        pink: {
          DEFAULT: 'var(--color-pink)',
          subtle: 'var(--color-pink-subtle)',
          text: 'var(--color-pink-text)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        studio: 'var(--shadow-studio)',
        'studio-hover': 'var(--shadow-card-hover)',
        elevated: 'var(--shadow-elevated)',
      }
    },
  },
  plugins: [],
}
