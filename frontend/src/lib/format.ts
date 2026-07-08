import type { Lens } from "../types";

export function fmtUSD(v: number, compact = true): string {
  if (compact) {
    if (Math.abs(v) >= 1e9) return `US$${(v / 1e9).toFixed(2)}B`;
    if (Math.abs(v) >= 1e6) return `US$${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `US$${(v / 1e3).toFixed(1)}k`;
    return `US$${Math.round(v)}`;
  }
  return "US$" + Math.round(v).toLocaleString("en-US");
}

export function fmtInt(v: number, compact = true): string {
  if (compact) {
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
    return `${Math.round(v)}`;
  }
  return Math.round(v).toLocaleString("en-US");
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`;
}

/** Format a value already expressed in the active lens' native unit. */
export function fmtLens(v: number, lens: Lens, compact = true): string {
  switch (lens) {
    case "cost":
      return fmtUSD(v, compact);
    case "doses":
      return fmtInt(v, compact);
  }
}

export function fmtSigned(v: number, digits = 1): string {
  return (v >= 0 ? "+" : "") + v.toFixed(digits);
}
