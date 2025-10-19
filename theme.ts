// This file defines the color palettes for different themes as CSS variables.
// The App component reads this file and injects the styles into the document's head,
// making it the single source of truth for all theme-related colors.

export const themes: Record<string, Record<string, string>> = {
  dark: { // New "Midnight" theme - richer, deeper, with a unified Indigo accent
    '--color-background': '15 23 42',       /* slate-900 */
    '--color-card': '30 41 59',          /* slate-800 */
    '--color-card-secondary': '51 65 85',   /* slate-700 */
    '--color-text-primary': '241 245 249',    /* slate-100 */
    '--color-text-secondary': '203 213 225', /* slate-300 */
    '--color-text-muted': '148 163 184',    /* slate-400 */
    '--color-border': '51 65 85',          /* slate-700 */
    '--color-input-bg': '51 65 85',          /* slate-700 */
    '--color-input-placeholder': '148 163 184', /* slate-400 */
    '--color-button-secondary-bg': '51 65 85',   /* slate-700 */
    '--color-button-secondary-hover-bg': '71 85 105', /* slate-600 */
    '--color-header-bg': '15 23 42',       /* slate-900 */
    '--color-accent': '99 102 241',       /* indigo-500 */
  },
  light: { // Muted light theme
    '--color-background': '243 244 246', /* gray-100 */
    '--color-card': '255 255 255', /* white */
    '--color-card-secondary': '229 231 235', /* gray-200 */
    '--color-text-primary': '31 41 55', /* gray-800 */
    '--color-text-secondary': '75 85 99', /* gray-600 */
    '--color-text-muted': '107 114 128', /* gray-500 */
    '--color-border': '209 213 219', /* gray-300 */
    '--color-input-bg': '255 255 255', /* white */
    '--color-input-placeholder': '156 163 175', /* gray-400 */
    '--color-button-secondary-bg': '229 231 235', /* gray-200 */
    '--color-button-secondary-hover-bg': '209 213 219', /* gray-300 */
    '--color-header-bg': '255 255 255',
    '--color-accent': '8 145 178', /* cyan-600 */
  },
};
