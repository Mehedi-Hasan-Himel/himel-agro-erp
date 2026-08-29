/**
 * Himel Agro ERP - Central Theme & Design System Tokens
 * Maintain international standard color contrast and unified branding.
 * Change color values here or in globals.css to update the whole application theme.
 */

export const THEME_COLORS = {
  // Brand Emerald Primary
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },

  // Slate Neutrals & Surfaces
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  // Semantic Status Colors (WCAG 2.1 AA / AAA compliant)
  status: {
    success: {
      text: "#065f46",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      solid: "#059669",
    },
    danger: {
      text: "#991b1b",
      bg: "#fef2f2",
      border: "#fecaca",
      solid: "#dc2626",
    },
    warning: {
      text: "#92400e",
      bg: "#fffbeb",
      border: "#fde68a",
      solid: "#d97706",
    },
    info: {
      text: "#075985",
      bg: "#f0f9ff",
      border: "#bae6fd",
      solid: "#0284c7",
    },
  },

  // Sex Badges
  sex: {
    male: {
      text: "#0369a1",
      bg: "#f0f9ff",
      border: "#bae6fd",
      icon: "♂",
    },
    female: {
      text: "#be185d",
      bg: "#fdf2f8",
      border: "#fbcfe8",
      icon: "♀",
    },
    unknown: {
      text: "#475569",
      bg: "#f8fafc",
      border: "#e2e8f0",
      icon: "?",
    },
  },
} as const;

export type ThemeColors = typeof THEME_COLORS;
