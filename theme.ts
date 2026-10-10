// This file defines the color palettes for different themes as CSS variables.
// The App component reads this file and injects the styles into the document's head,
// making it the single source of truth for all theme-related colors.

export const themes: Record<string, Record<string, string>> = {
  light: {
    '--color-background': '248 247 244', '--color-card': '255 255 255',
    '--color-card-secondary': '239 238 233', '--color-text-primary': '33 41 37',
    '--color-text-secondary': '88 99 92', '--color-text-muted': '108 118 111',
    '--color-border': '221 224 217', '--color-input-bg': '255 255 255',
    '--color-input-placeholder': '133 141 135', '--color-button-secondary-bg': '239 238 233',
    '--color-button-secondary-hover-bg': '226 230 224', '--color-header-bg': '248 247 244',
    '--color-accent': '35 91 71',
  },
  dark: {
    '--color-background': '22 29 26', '--color-card': '30 39 34',
    '--color-card-secondary': '39 49 43', '--color-text-primary': '242 245 239',
    '--color-text-secondary': '190 201 191', '--color-text-muted': '152 169 157',
    '--color-border': '62 76 65', '--color-input-bg': '27 35 30',
    '--color-input-placeholder': '142 158 146', '--color-button-secondary-bg': '39 49 43',
    '--color-button-secondary-hover-bg': '52 65 55', '--color-header-bg': '22 29 26',
    '--color-accent': '44 117 84',
  },
};
