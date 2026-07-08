import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useStore } from "../store";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { LensTooltip } from "../components/ChartTooltip";
import { C, axisProps, SCENARIO_COLORS, inkFor } from "../lib/theme";
import { fmtLens } from "../lib/format";
import { LENS_META } from "../lib/transform";
import {
  buildTrajectory,
  forecastAt,
  cumulativeForecast,
  scenarioAt,
  forecastYears,
  lastHistoricalYear,
} from "../lib/series";

export function Overview() {
  const { data, country, lens, ctx, dark } = useStore();
  const ink = inkFor(dark);
  const years = forecastYears(data);
  const endYear = years[years.length - 1];
  const lhy = lastHistoricalYear(data, country);
  const traj = buildTrajectory(data, country, lens, ctx, years[0] - 20);
  const yFmt = (v: number) => fmtLens(v, lens);

  const budget2030 = forecastAt(data, country, endYear, "cost", ctx);
  const cumBudget = cumulativeForecast(data, country, "cost", ctx);
  const doses2030 = forecastAt(data, country, endYear, "doses", ctx);
  const countryMape = data.meta.backtestMAPE[country];

  // scenario budget range at the final horizon year (US$) — via shared transform
  const scen = data.scenarios[country] ?? {};
  const scen2030 = Object.keys(scen).map((k) => ({
    key: k,
    label: data.scenarioMeta[k]?.label ?? k,
    color: SCENARIO_COLORS[k] ?? data.scenarioMeta[k]?.color ?? C.slate,
    cost: scenarioAt(data, country, k, endYear, "cost", ctx),
  }));
  const costs = scen2030.map((s) => s.cost);
  const lo = Math.min(...costs);
  const hi = Math.max(...costs);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={`${endYear} Procurement Budget`}
          value={fmtLens(budget2030, "cost")}
          sub={`${country} · ${LENS_META.cost.label}`}
        />
        <KpiCard
          label="6-Year Cumulative Budget"
          value={fmtLens(cumBudget, "cost")}
          sub={`${data.meta.horizon[0]}–${data.meta.horizon[1]} total`}
        />
        <KpiCard
          label={`${endYear} doses to procure`}
          value={fmtLens(doses2030, "doses")}
          sub={`@ ${Math.round(ctx.wastage * 100)}% wastage`}
        />
        <KpiCard
          label="Forecast confidence"
          value={`${(100 - countryMape).toFixed(1)}%`}
          sub={`${country} backtest · ${countryMape}% MAPE`}
          hint="100 − mean absolute percentage error from the walk-forward backtest for this country."
        />
      </div>

      {/* Main trajectory */}
      <ChartCard
        title={`${country} — Historical targets, baseline forecast & uncertainty`}
        subtitle={`Lens: ${LENS_META[lens].label} · shaded band = Monte Carlo P5–P95 / P25–P75`}
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={traj} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} width={64} tickFormatter={yFmt} />
            <Tooltip content={(p) => <LensTooltip {...p} lens={lens} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={lhy} stroke={C.slate} strokeDasharray="3 3" label={{ value: "forecast →", fontSize: 10, fill: C.slate, position: "insideTopRight" }} />
            <Area dataKey="band90" name="P5–P95" stroke="none" fill={C.teal} fillOpacity={0.12} isAnimationActive={false} />
            <Area dataKey="band50" name="P25–P75" stroke="none" fill={C.teal} fillOpacity={0.22} isAnimationActive={false} />
            <Line dataKey="history" name="Historical" stroke={ink} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line dataKey="forecast" name="Baseline forecast" stroke={C.teal} strokeWidth={2.4} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line dataKey="p50" name="MC median" stroke={C.amber} strokeWidth={1.6} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Scenario budget range */}
        <ChartCard
          title="2030 budget by scenario"
          subtitle={`Range ${fmtLens(lo, "cost")} – ${fmtLens(hi, "cost")} · planning envelope`}
        >
          <div className="space-y-2.5">
            {scen2030
              .sort((a, b) => a.cost - b.cost)
              .map((s) => {
                const pct = ((s.cost - lo) / (hi - lo || 1)) * 100;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                      {s.label}
                    </span>
                    <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-zinc-100 dark:bg-white/[0.04]">
                      <div
                        className="absolute left-0 top-0 h-full rounded-md"
                        style={{ width: `${18 + pct * 0.8}%`, background: s.color, opacity: 0.9 }}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold tabular-nums text-ink dark:text-white">
                        {fmtLens(s.cost, "cost")}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartCard>

        {/* Model trust strip */}
        <ChartCard
          title="Model reliability"
          subtitle="Walk-forward backtest — recomputed from current model"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line p-3 dark:border-white/[0.06]">
              <div className="kpi-label">Overall MAPE</div>
              <div className="mt-1 text-[20px] font-semibold tabular-nums text-ink dark:text-white">
                {data.meta.modelMAPE}%
              </div>
              <div className="muted mt-0.5">MAE {data.meta.modelMAE} (thousand doses)</div>
            </div>
            <div className="rounded-md border border-line p-3 dark:border-white/[0.06]">
              <div className="kpi-label">Per-country MAPE</div>
              <div className="mt-1.5 space-y-1">
                {Object.entries(data.meta.backtestMAPE).map(([c, m]) => (
                  <div key={c} className="flex justify-between text-[12px]">
                    <span className={c === country ? "font-semibold text-ink dark:text-white" : "text-zinc-500"}>
                      {c}
                    </span>
                    <span className="tabular-nums text-zinc-600 dark:text-zinc-300">{m}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="muted mt-3 leading-relaxed">
            {data.meta.targetSemantics}. Lower MAPE = higher confidence in the budget forecast.
          </p>
        </ChartCard>
      </div>
    </div>
  );
}
