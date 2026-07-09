// Refined chart color system — neutral ink + single indigo accent, restrained.
export const C = {
  ink: "#18181b", // primary line (history)
  accent: "#0089cf", // Gavi blue — forecast / primary accent
  accentSoft: "#38a9dd",
  muted: "#a1a1aa", // zinc-400
  grid: "rgba(113,113,122,0.14)",
  // semantic (desaturated)
  emerald: "#059669",
  rose: "#e11d48",
  amber: "#d97706",
  violet: "#7c3aed",
  slate: "#71717a",
  // legacy aliases used across pages
  navy: "#18181b",
  navyLight: "#52525b",
  teal: "#0089cf",
  tealLight: "#38a9dd",
  red: "#e11d48",
  green: "#059669",
  purple: "#7c3aed",
};

// Frontend-controlled scenario colors (override the brighter values in data.json
// for a consistent, refined look). Keyed by scenario name.
export const SCENARIO_COLORS: Record<string, string> = {
  baseline: "#18181b",
  optimistic: "#059669",
  pessimistic: "#e11d48",
  pandemic: "#7c3aed",
};
export const SCENARIO_FALLBACK = SCENARIO_COLORS;

// Primary line color, flipped for dark mode.
export const inkFor = (dark: boolean) => (dark ? "#e4e4e7" : "#18181b");

export const axisProps = {
  tick: { fontSize: 11 },
  stroke: "transparent",
  tickLine: false,
  axisLine: false,
} as const;
