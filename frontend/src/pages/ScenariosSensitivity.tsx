import { useState } from "react";
import {
  ComposedChart,
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useStore } from "../store";
import { ChartCard } from "../components/ChartCard";
import { KpiCard } from "../components/KpiCard";
import { LensTooltip } from "../components/ChartTooltip";
import { C, axisProps, SCENARIO_FALLBACK, inkFor } from "../lib/theme";
import { fmtLens, fmtSigned, fmtUSD } from "../lib/format";
import { toLens } from "../lib/transform";
import { forecastYears } from "../lib/series";
import {
  SCENARIO_PRESETS,
  scenarioTargets,
  coverageBaseline,
  type Levers,
} from "../lib/scenario";

export function ScenariosSensitivity() {
  const { data, country } = useStore();
  const years = forecastYears(data);
  const finalYear = years[years.length - 1];

  return (
    <div className="space-y-4">
      <ScenarioBuilder />
      <Tornado
        country={country}
        finalYear={finalYear}
        tornado={data.tornadoData[country] ?? []}
        importance={data.featureImportance[country] ?? []}
        elasticity={data.elasticityData[country] ?? {}}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
function ScenarioBuilder() {
  const { data, country, lens, ctx, dark } = useStore();
  const ink = inkFor(dark);
  const years = forecastYears(data);
  const finalIdx = years.length - 1;
  const finalYear = years[finalIdx];
  const yFmt = (v: number) => fmtLens(v, lens);

  const [levers, setLevers] = useState<Levers>({ cohortPct: 0, coveragePP: 0 });
  const [advanced, setAdvanced] = useState(false);

  const activePreset =
    SCENARIO_PRESETS.find((p) => p.cohortPct === levers.cohortPct && p.coveragePP === levers.coveragePP)
      ?.key ?? "custom";

  const fb = data.forecastBaseline[country] ?? [];
  const cov0 = coverageBaseline(data, country);
  const scen = scenarioTargets(data, country, levers);
  const opt = scenarioTargets(data, country, SCENARIO_PRESETS.find((p) => p.key === "optimistic")!);
  const pess = scenarioTargets(data, country, SCENARIO_PRESETS.find((p) => p.key === "pessimistic")!);

  const rows = years.map((y, i) => {
    const lo = Math.min(toLens(pess[i], lens, ctx), toLens(opt[i], lens, ctx));
    const hi = Math.max(toLens(pess[i], lens, ctx), toLens(opt[i], lens, ctx));
    return {
      year: y,
      Baseline: toLens(fb[i], lens, ctx),
      Scenario: toLens(scen[i], lens, ctx),
      envelope: [lo, hi] as [number, number],
    };
  });

  // KPIs (US$)
  const costOf = (t: number) => toLens(t, "cost", ctx);
  const baseEnd = costOf(fb[finalIdx]);
  const scenEnd = costOf(scen[finalIdx]);
  const delta = scenEnd - baseEnd;
  const pct = baseEnd ? (delta / baseEnd) * 100 : 0;
  const cumBase = fb.reduce((s, t) => s + costOf(t), 0);
  const cumScen = scen.reduce((s, t) => s + costOf(t), 0);
  const cumDelta = cumScen - cumBase;
  const covEndBase = cov0[finalIdx] ?? 0;
  const covEndScen = Math.max(0, covEndBase + levers.coveragePP);

  // advanced (model-driven) view from data.scenarios
  const mscen = data.scenarios[country] ?? {};
  const mKeys = Object.keys(mscen);
  const mRows = years.map((y, i) => {
    const r: Record<string, number> = { year: y };
    for (const k of mKeys) r[k] = toLens(mscen[k][i], lens, ctx);
    return r;
  });

  return (
    <ChartCard
      title={`${country} — Scenario planner`}
      subtitle={
        advanced
          ? "Advanced: model-driven demographic scenarios (recursive) — kept for reference"
          : "Transparent what-if envelope: two levers scale the baseline forecast"
      }
      right={
        <div className="flex rounded-md bg-zinc-100 p-0.5 dark:bg-white/[0.04]">
          <button className={`seg-btn ${!advanced ? "seg-btn-active" : "seg-btn-idle"}`} onClick={() => setAdvanced(false)}>
            Builder
          </button>
          <button className={`seg-btn ${advanced ? "seg-btn-active" : "seg-btn-idle"}`} onClick={() => setAdvanced(true)}>
            Model-driven
          </button>
        </div>
      }
    >
      {advanced ? (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={mRows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} width={64} tickFormatter={yFmt} />
            <Tooltip content={(p) => <LensTooltip {...p} lens={lens} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {mKeys.map((k) => (
              <Line
                key={k}
                dataKey={k}
                name={data.scenarioMeta[k]?.label ?? k}
                stroke={SCENARIO_FALLBACK[k] ?? C.slate}
                strokeWidth={k === "baseline" ? 2.6 : 1.8}
                strokeDasharray={k === "baseline" ? undefined : "5 4"}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="space-y-5">
          {/* presets */}
          <div className="flex flex-wrap items-center gap-2">
            {SCENARIO_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setLevers({ cohortPct: p.cohortPct, coveragePP: p.coveragePP })}
                title={p.description}
                className={`rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                  activePreset === p.key
                    ? "border-transparent text-white"
                    : "border-line text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.04]"
                }`}
                style={activePreset === p.key ? { background: p.color } : undefined}
              >
                {p.label}
              </button>
            ))}
            {activePreset === "custom" && (
              <span className="rounded-md border border-teal/40 px-2.5 py-1.5 text-[12px] font-medium text-teal">
                Custom
              </span>
            )}
          </div>

          {/* levers */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Slider
              label="Cohort / demand shock"
              value={levers.cohortPct}
              min={-20}
              max={20}
              suffix="%"
              readout={`births ${fmtSigned(levers.cohortPct, 0)}% → doses scale ∝`}
              onChange={(v) => setLevers((l) => ({ ...l, cohortPct: v }))}
            />
            <Slider
              label="Coverage shock"
              value={levers.coveragePP}
              min={-30}
              max={20}
              suffix="pp"
              readout={`coverage ${covEndBase.toFixed(0)}% → ${covEndScen.toFixed(0)}% by ${finalYear}`}
              onChange={(v) => setLevers((l) => ({ ...l, coveragePP: v }))}
            />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label={`${finalYear} budget`} value={fmtUSD(scenEnd)} sub={`baseline ${fmtUSD(baseEnd)}`} />
            <KpiCard
              label={`Δ vs baseline · ${finalYear}`}
              value={`${delta >= 0 ? "+" : "−"}${fmtUSD(Math.abs(delta))}`}
              sub={`${fmtSigned(pct)}%`}
            />
            <KpiCard
              label="6-yr cumulative Δ"
              value={`${cumDelta >= 0 ? "+" : "−"}${fmtUSD(Math.abs(cumDelta))}`}
              sub={`vs ${fmtUSD(cumBase)} baseline`}
            />
            <KpiCard label={`Coverage ${finalYear}`} value={`${covEndScen.toFixed(1)}%`} sub={`from ${covEndBase.toFixed(1)}%`} />
          </div>

          {/* chart */}
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} width={64} tickFormatter={yFmt} />
              <Tooltip content={(p) => <LensTooltip {...p} lens={lens} note="Envelope = pessimistic … optimistic presets" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area dataKey="envelope" name="Planning envelope" stroke="none" fill={C.accent} fillOpacity={0.08} isAnimationActive={false} />
              <Line dataKey="Baseline" stroke={ink} strokeWidth={2.4} dot={false} isAnimationActive={false} />
              <Line dataKey="Scenario" stroke={C.accent} strokeWidth={2.6} dot={{ r: 2.5 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  readout,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  readout: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-md border border-line p-3 dark:border-white/[0.06]">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <span className="text-[13px] font-semibold tabular-nums text-ink dark:text-white">
          {fmtSigned(value, 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer appearance-none bg-zinc-200 accent-teal dark:bg-white/10"
      />
      <div className="muted mt-1.5">{readout}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
function Tornado({
  country,
  finalYear,
  tornado,
  importance,
  elasticity,
}: {
  country: string;
  finalYear: number;
  tornado: { feature: string; pos: number; neg: number }[];
  importance: { name: string; impact: string; score: number }[];
  elasticity: Record<string, { x: number; y: number }[]>;
}) {
  const { dark } = useStore();
  const ink = inkFor(dark);
  const elasticFeatures = Object.keys(elasticity);
  const [sel, setSel] = useState(elasticFeatures[0]);
  const active = elasticity[sel ?? elasticFeatures[0]] ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Sensitivity — tornado"
        subtitle={`Avg % change in ${country} forecast from ±5% shift in each driver`}
      >
        <ResponsiveContainer width="100%" height={Math.max(220, tornado.length * 34)}>
          <BarChart data={tornado} layout="vertical" stackOffset="sign" margin={{ left: 8, right: 16 }}>
            <CartesianGrid stroke={C.grid} horizontal={false} />
            <XAxis type="number" {...axisProps} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="feature" {...axisProps} width={92} />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
            <ReferenceLine x={0} stroke={C.slate} />
            <Bar dataKey="neg" name="−5% input" fill={C.rose} />
            <Bar dataKey="pos" name="+5% input" fill={C.accent} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-2">
          {importance.map((f) => (
            <span
              key={f.name}
              className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                f.impact === "HIGH"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  : f.impact === "MEDIUM"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400"
              }`}
            >
              {f.name} · {f.impact} ({f.score})
            </span>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Elasticity curve"
        subtitle={`% change in ${finalYear} forecast as a driver moves −20% … +20%`}
        right={
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="field">
            {elasticFeatures.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={active} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} />
            <XAxis dataKey="x" {...axisProps} tickFormatter={(v) => `${v}%`} />
            <YAxis {...axisProps} width={48} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} labelFormatter={(l) => `Input ${l}%`} />
            <ReferenceLine x={0} stroke={C.slate} strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke={C.slate} strokeDasharray="3 3" />
            <Line dataKey="y" name={sel} stroke={ink} strokeWidth={2.4} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
