import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Legend,
} from "recharts";
import { useStore } from "../store";
import { ChartCard } from "../components/ChartCard";
import { LensTooltip } from "../components/ChartTooltip";
import { C, axisProps, inkFor } from "../lib/theme";
import { fmtLens, fmtInt } from "../lib/format";
import { LENS_META, childrenCovered, dosesAt, costAt } from "../lib/transform";
import { buildTrajectory, forecastYears, lastHistoricalYear } from "../lib/series";

export function ForecastDemographics() {
  const { data, country, lens, ctx, dark } = useStore();
  const ink = inkFor(dark);
  const years = forecastYears(data);
  const lhy = lastHistoricalYear(data, country);
  const traj = buildTrajectory(data, country, lens, ctx, years[0] - 25);
  const yFmt = (v: number) => fmtLens(v, lens);
  const fb = data.forecastBaseline[country] ?? [];

  // forecast detail table (all three lenses from one target)
  const rows = years.map((y, i) => {
    const t = fb[i];
    return {
      year: y,
      children: childrenCovered(t, data.costConfig) * 1000,
      doses: dosesAt(t, ctx) * 1000,
      cost: costAt(t, ctx),
    };
  });

  const trends = data.demographicTrends[country] ?? [];

  return (
    <div className="space-y-5">
      <ChartCard
        title={`${country} — Past targets → baseline forecast`}
        subtitle={`Lens: ${LENS_META[lens].label} · dashed = forecast (${years[0]}–${years[years.length - 1]})`}
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={traj} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} width={64} tickFormatter={yFmt} />
            <Tooltip content={(p) => <LensTooltip {...p} lens={lens} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={lhy} stroke={C.slate} strokeDasharray="3 3" />
            <Area dataKey="band90" name="P5–P95" stroke="none" fill={C.teal} fillOpacity={0.1} isAnimationActive={false} />
            <Line dataKey="history" name="Historical target" stroke={ink} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line dataKey="forecast" name="Baseline forecast" stroke={C.teal} strokeWidth={2.4} strokeDasharray="5 4" dot={{ r: 2.5 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* forecast table */}
      <ChartCard
        title="Forecast detail"
        subtitle={`Children covered, doses to procure @ ${Math.round(ctx.wastage * 100)}% wastage, and procurement budget`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left dark:border-white/[0.06]">
                {["Year", "Children covered", "Doses to procure", "Budget (US$)"].map((h) => (
                  <th key={h} className="px-3 py-2 text-[11px] font-semibold text-zinc-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-line last:border-0 dark:border-white/[0.04]">
                  <td className="px-3 py-2 font-semibold text-navy dark:text-white">{r.year}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{fmtInt(r.children, false)}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{fmtInt(r.doses, false)}</td>
                  <td className="px-3 py-2 font-semibold text-teal-dark dark:text-teal-light">{fmtLens(r.cost, "cost", false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Demographic drivers */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Births & birth cohort" subtitle="Annual births (absolute) — the top of the demand funnel">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends} margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} width={48} tickFormatter={(v) => fmtInt(v)} />
              <Tooltip formatter={(v: number) => fmtInt(v, false)} />
              <Line dataKey="births" name="Births" stroke={ink} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mortality drivers" subtitle="Infant (IMR) & under-5 mortality rates per 1,000">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends} margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="imr" name="IMR" stroke={C.red} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="u5" name="Under-5" stroke={C.amber} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
