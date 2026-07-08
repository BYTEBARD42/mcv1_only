// Scenario levers applied to the baseline forecast:
//   cohort shock (births ± %)   scales the birth cohort, and doses with it
//   coverage shock (± pp)       changes the fraction reached
//
//   adjusted_target[y] = baseline[y] * (1 + cohortPct/100)
//                                    * (cov0[y] + coveragePP) / cov0[y]
import type { DashboardData } from "../types";
import { forecastYears, popAge0Map } from "./series";

export interface Levers {
  cohortPct: number; // births/cohort shock, %
  coveragePP: number; // coverage shock, percentage points
}

export interface Preset extends Levers {
  key: string;
  label: string;
  color: string;
  description: string;
}

export const SCENARIO_PRESETS: Preset[] = [
  { key: "baseline", label: "Baseline", color: "#18181b", cohortPct: 0, coveragePP: 0,
    description: "UN medium-variant, no adjustment" },
  { key: "optimistic", label: "Optimistic", color: "#059669", cohortPct: 2, coveragePP: 5,
    description: "Stronger health system: +5pp coverage, +2% cohort" },
  { key: "pessimistic", label: "Pessimistic", color: "#e11d48", cohortPct: -3, coveragePP: -5,
    description: "System stress: −5pp coverage, −3% cohort" },
  { key: "pandemic", label: "Pandemic", color: "#7c3aed", cohortPct: -3, coveragePP: -15,
    description: "Coverage collapse: −15pp coverage, −3% cohort" },
];

/** Baseline effective coverage % per forecast year (target*0.75 / popAge0). */
export function coverageBaseline(data: DashboardData, country: string): number[] {
  const pa = popAge0Map(data, country);
  const years = forecastYears(data);
  const fb = data.forecastBaseline[country] ?? [];
  const baked = 1 - data.costConfig.bakedInWastage;
  return years.map((y, i) => (pa[y] ? (fb[i] * baked) / pa[y] * 100 : 0));
}

/** Adjusted target series (thousands) under the given levers. */
export function scenarioTargets(
  data: DashboardData,
  country: string,
  levers: Levers
): number[] {
  const fb = data.forecastBaseline[country] ?? [];
  const cov0 = coverageBaseline(data, country);
  const cohortFactor = 1 + levers.cohortPct / 100;
  return fb.map((t, i) => {
    const covFactor = cov0[i] > 0 ? Math.max(0, cov0[i] + levers.coveragePP) / cov0[i] : 1;
    return t * cohortFactor * covFactor;
  });
}

/** Resulting effective coverage % per year under the levers (for readout). */
export function scenarioCoverage(
  data: DashboardData,
  country: string,
  levers: Levers
): number[] {
  return coverageBaseline(data, country).map((c) => Math.max(0, c + levers.coveragePP));
}
