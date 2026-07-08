import { useStore } from "../store";
import type { Lens } from "../types";
import { LENS_META } from "../lib/transform";
import { buildMergedReport, downloadCsv } from "../lib/report";

const LENSES: Lens[] = ["cost", "doses"];

export function ControlBar() {
  const { data, country, setCountry, lens, setLens, wastage, setWastage, ctx } = useStore();
  const wPct = Math.round(wastage * 100);
  const baked = Math.round(data.costConfig.bakedInWastage * 100);

  const download = (scope: "country" | "all") => {
    const list = scope === "country" ? [country] : data.countries;
    const csv = buildMergedReport(data, ctx, list);
    const tag = scope === "country" ? country.toLowerCase() : "all-countries";
    downloadCsv(`mcv1-forecast-report_${tag}_w${wPct}.csv`, csv);
  };

  return (
    <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="kpi-label">Country</span>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="field">
          {data.countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="h-5 w-px bg-line dark:bg-white/10" />

      <div className="flex items-center gap-2">
        <span className="kpi-label">Lens</span>
        <div className="flex rounded-md bg-zinc-100 p-0.5 dark:bg-white/[0.04]">
          {LENSES.map((l) => (
            <button
              key={l}
              onClick={() => setLens(l)}
              className={`seg-btn ${lens === l ? "seg-btn-active" : "seg-btn-idle"}`}
            >
              {LENS_META[l].short}
            </button>
          ))}
        </div>
      </div>

      <div className="h-5 w-px bg-line dark:bg-white/10" />

      <div className="flex min-w-[240px] flex-1 items-center gap-3">
        <span className="kpi-label whitespace-nowrap">Wastage</span>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={wPct}
          onChange={(e) => setWastage(Number(e.target.value) / 100)}
          className="flex-1 cursor-pointer appearance-none bg-zinc-200 accent-teal dark:bg-white/10"
          title={`10-dose vial wastage. Baseline (${baked}%) reproduces the published target.`}
        />
        <span className="w-16 text-right text-[13px] font-semibold tabular-nums text-ink dark:text-white">
          {wPct}%
        </span>
      </div>

      <div className="h-5 w-px bg-line dark:bg-white/10" />

      {/* Download merged forecast × future-demographics CSV */}
      <div className="flex items-center gap-2">
        <span className="kpi-label whitespace-nowrap">Report</span>
        <button onClick={() => download("country")} className="btn-ghost" title={`Forecast + demographics CSV for ${country} at ${wPct}% wastage`}>
          ↓ {country}
        </button>
        <button onClick={() => download("all")} className="btn-ghost" title="All countries, merged forecast × future-demographics CSV">
          ↓ All
        </button>
      </div>
    </div>
  );
}
