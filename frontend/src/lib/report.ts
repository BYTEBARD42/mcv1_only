// Builds the merged forecast × future-demographics CSV. Cost/doses use
// costConfig and the active wastage.
import type { DashboardData } from "../types";
import type { LensCtx } from "./transform";
import { childrenCovered, dosesAt, costAt } from "./transform";
import { forecastYears } from "./series";

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** One row per country × forecast year: model forecast + demand/cost + demographics. */
export function buildMergedReport(
  data: DashboardData,
  ctx: LensCtx,
  countries?: string[]
): string {
  const cols = [
    "country",
    "year",
    "mcv1_target_thousands",
    "children_covered",
    "doses_to_procure",
    "wastage_pct",
    "procurement_cost_usd",
    "price_per_dose_usd",
    // future demographics
    "pop_age0_thousands",
    "population_thousands",
    "births_thousands",
    "crude_birth_rate",
    "infant_mortality_rate",
    "under5_mortality",
    "net_migration_thousands",
    "net_migration_rate",
  ];

  const years = forecastYears(data);
  const list = countries ?? data.countries;
  const lines = [cols.join(",")];

  for (const c of list) {
    const fb = data.forecastBaseline[c] ?? [];
    const fut = data.futureDemographics[c] ?? [];
    const futByYear = new Map(fut.map((r) => [r.year, r]));
    years.forEach((y, i) => {
      const t = fb[i];
      if (t == null) return;
      const d = futByYear.get(y);
      const row = [
        c,
        y,
        t,
        Math.round(childrenCovered(t, data.costConfig) * 1000),
        Math.round(dosesAt(t, ctx) * 1000),
        Math.round(ctx.wastage * 100),
        Math.round(costAt(t, ctx)),
        data.costConfig.pricePerDose,
        d?.popAge0 ?? "",
        d?.population ?? "",
        d?.births ?? "",
        d?.crudeBirthRate ?? "",
        d?.infantMortalityRate ?? "",
        d?.under5Mortality ?? "",
        d?.netMigration ?? "",
        d?.netMigrationRate ?? "",
      ];
      lines.push(row.map(csvEscape).join(","));
    });
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
