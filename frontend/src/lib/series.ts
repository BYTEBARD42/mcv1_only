// Builders that turn raw data + active lens/wastage into chart-ready rows.
// Years and the history/forecast boundary come from meta.horizon and the data.
import type { DashboardData, Lens } from "../types";
import type { LensCtx } from "./transform";
import { toLens } from "./transform";

/** Forecast horizon years, derived from meta.horizon. */
export function forecastYears(data: DashboardData): number[] {
  const [a, b] = data.meta.horizon;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

/** Last year present in the historical series for a country. */
export function lastHistoricalYear(data: DashboardData, country: string): number {
  const h = data.historical[country] ?? [];
  return h.reduce((mx, r) => Math.max(mx, r.year), h[0]?.year ?? 0);
}

export function popAge0Map(data: DashboardData, country: string): Record<number, number> {
  const m: Record<number, number> = {};
  for (const p of data.popAge0[country] ?? []) m[p.year] = p.popAge0;
  return m;
}

export interface TrajRow {
  year: number;
  history?: number;
  forecast?: number;
  p5?: number;
  p95?: number;
  p25?: number;
  p75?: number;
  p50?: number;
  band90?: [number, number];
  band50?: [number, number];
}

/** Combined historical + baseline forecast + MC fan, all in the active lens. */
export function buildTrajectory(
  data: DashboardData,
  country: string,
  lens: Lens,
  ctx: LensCtx,
  historyFrom: number
): TrajRow[] {
  const years = forecastYears(data);
  const rows = new Map<number, TrajRow>();
  const get = (y: number) => {
    let r = rows.get(y);
    if (!r) {
      r = { year: y };
      rows.set(y, r);
    }
    return r;
  };

  for (const h of data.historical[country] ?? []) {
    if (h.year < historyFrom) continue;
    get(h.year).history = toLens(h.value, lens, ctx);
  }

  const fb = data.forecastBaseline[country] ?? [];
  years.forEach((y, i) => {
    if (fb[i] == null) return;
    get(y).forecast = toLens(fb[i], lens, ctx);
  });

  // bridge: seed the forecast line at the last historical point for continuity
  const lhy = lastHistoricalYear(data, country);
  const lastHist = (data.historical[country] ?? []).find((h) => h.year === lhy);
  if (lastHist) get(lhy).forecast = toLens(lastHist.value, lens, ctx);

  for (const m of data.mcData[country] ?? []) {
    const r = get(m.year);
    r.p5 = toLens(m.p5, lens, ctx);
    r.p25 = toLens(m.p25, lens, ctx);
    r.p50 = toLens(m.p50, lens, ctx);
    r.p75 = toLens(m.p75, lens, ctx);
    r.p95 = toLens(m.p95, lens, ctx);
    r.band90 = [r.p5, r.p95];
    r.band50 = [r.p25, r.p75];
  }

  return [...rows.values()].sort((a, b) => a.year - b.year);
}

/** Baseline target for a given forecast year, in the active lens. */
export function forecastAt(
  data: DashboardData,
  country: string,
  year: number,
  lens: Lens,
  ctx: LensCtx
): number {
  const i = forecastYears(data).indexOf(year);
  const v = data.forecastBaseline[country]?.[i];
  if (v == null) return 0;
  return toLens(v, lens, ctx);
}

/** Cumulative value across the whole forecast horizon, in the active lens. */
export function cumulativeForecast(
  data: DashboardData,
  country: string,
  lens: Lens,
  ctx: LensCtx
): number {
  return (data.forecastBaseline[country] ?? []).reduce(
    (s, v) => s + toLens(v, lens, ctx),
    0
  );
}

/** A scenario's value for a forecast year, in the active lens. */
export function scenarioAt(
  data: DashboardData,
  country: string,
  scenario: string,
  year: number,
  lens: Lens,
  ctx: LensCtx
): number {
  const i = forecastYears(data).indexOf(year);
  const v = data.scenarios[country]?.[scenario]?.[i];
  if (v == null) return 0;
  return toLens(v, lens, ctx);
}
