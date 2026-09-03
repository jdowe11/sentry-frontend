/**
 * Sentry Design System Theme Constants
 * Centralized, reusable tokens for programmatic and styling use.
 */

export const THEME_COLORS = {
  // Brand Accent: Emerald
  brand: {
    primary: "#059669",
    hover: "#047857",
    active: "#065f46",
    light: "#10b981",
    subtle: "rgba(5, 150, 105, 0.12)",
    border: "rgba(5, 150, 105, 0.35)",
  },

  // Surface Elevation Hierarchy
  surface: {
    base: "#090B0E",        // Main application canvas / backdrop
    rail: "#0C0F14",        // Activity rail on far left
    sidebar: "#11151C",     // Contextual / conversation sidebar
    card: "#161B24",        // Content cards, message stages, headers
    cardHover: "#1C232E",   // Hover state for interactive items
    popover: "#181E29",     // Tooltips, dropdowns, modals
    input: "#0E1218",       // Form inputs and text fields
  },

  // Text Contrast Levels
  text: {
    primary: "#F3F4F6",     // High contrast main text
    secondary: "#D1D5DB",   // Body text
    muted: "#9CA3AF",       // Timestamps, secondary labels
    subtle: "#6B7280",      // Placeholders, disabled text
    emerald: "#10B981",     // Highlighted security text
  },

  // Borders & Separators
  border: {
    subtle: "rgba(255, 255, 255, 0.07)",
    default: "#1E2533",
    strong: "#283143",
    focus: "#059669",
  },

  // Status Indicators
  status: {
    online: "#10B981",
    idle: "#F59E0B",
    dnd: "#EF4444",
    offline: "#6B7280",
    e2eeSecured: "#10B981",
  },

  // Destructive / Warning
  feedback: {
    danger: "#EF4444",
    dangerHover: "#DC2626",
    dangerSubtle: "rgba(239, 68, 68, 0.12)",
    warning: "#F59E0B",
    success: "#10B981",
  },
} as const;

export const THEME_RADII = {
  sm: "8px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  full: "9999px",
} as const;
