// Converts the model target (thousands, incl. 25% wastage) into the business lenses.
// Constants come from costConfig.
//
//   children_covered = target * (1 - bakedInWastage)
//   doses(w)         = children_covered / (1 - w)      // w = wastage
//   cost(w)  (US$)   = doses * 1000 * pricePerDose

import type { CostConfig, Lens } from "../types";

export interface LensCtx {
  cost: CostConfig;
  wastage: number; // 0..0.5
}

/** children covered (thousands) — the wastage-invariant base signal. */
export function childrenCovered(target: number, cost: CostConfig): number {
  return target * (1 - cost.bakedInWastage);
}

/** doses to procure (thousands) at the chosen wastage. */
export function dosesAt(target: number, ctx: LensCtx): number {
  return childrenCovered(target, ctx.cost) / (1 - ctx.wastage);
}

/** procurement cost in US$ at the chosen wastage. */
export function costAt(target: number, ctx: LensCtx): number {
  return dosesAt(target, ctx) * 1000 * ctx.cost.pricePerDose;
}

/** Convert a raw target value to the active lens' displayed number. */
export function toLens(target: number, lens: Lens, ctx: LensCtx): number {
  switch (lens) {
    case "cost":
      return costAt(target, ctx);
    case "doses":
      return dosesAt(target, ctx) * 1000; // thousands -> absolute doses
  }
}

export const LENS_META: Record<Lens, { label: string; short: string; unit: string }> = {
  cost: { label: "Budget (US$)", short: "US$", unit: "US$" },
  doses: { label: "Doses / Demand", short: "Doses", unit: "doses" },
};
