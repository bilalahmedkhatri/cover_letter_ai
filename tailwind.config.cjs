module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          secondary: 'rgb(var(--color-card-secondary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: {
          bg: 'rgb(var(--color-input-bg) / <alpha-value>)',
          placeholder: 'rgb(var(--color-input-placeholder) / <alpha-value>)',
        },
        button: {
            secondary: {
                bg: 'rgb(var(--color-button-secondary-bg) / <alpha-value>)',
                'hover-bg': 'rgb(var(--color-button-secondary-hover-bg) / <alpha-value>)',
            }
        },
        header: {
            bg: 'rgb(var(--color-header-bg) / <alpha-value>)'
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'dropdown-enter': 'dropdown-enter 0.2s ease-out forwards',
      },
      keyframes: {
        'slide-up': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'dropdown-enter': {
            'from': { opacity: '0', transform: 'scale(0.95) translateY(-5px)' },
            'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  plugins: [],
}
