import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useStore } from "../store";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { LensTooltip } from "../components/ChartTooltip";
import { C, axisProps, inkFor } from "../lib/theme";
import { fmtLens } from "../lib/format";
import { LENS_META, toLens } from "../lib/transform";
import { forecastYears } from "../lib/series";

export function Uncertainty() {
  const { data, country, lens, ctx, dark } = useStore();
  const ink = inkFor(dark);
  const years = forecastYears(data);
  const mc = data.mcData[country] ?? [];
  const yFmt = (v: number) => fmtLens(v, lens);

  const fan = mc.map((m) => ({
    year: m.year,
    p5: toLens(m.p5, lens, ctx),
    p25: toLens(m.p25, lens, ctx),
    p50: toLens(m.p50, lens, ctx),
    p75: toLens(m.p75, lens, ctx),
    p95: toLens(m.p95, lens, ctx),
    band90: [toLens(m.p5, lens, ctx), toLens(m.p95, lens, ctx)] as [number, number],
    band50: [toLens(m.p25, lens, ctx), toLens(m.p75, lens, ctx)] as [number, number],
  }));

  // Budget-at-risk (always in US$) at the final horizon year
  const last = mc[mc.length - 1];
  const costOf = (v: number) => toLens(v, "cost", ctx);
  const upside = last ? costOf(last.p95) - costOf(last.p50) : 0;
  const downside = last ? costOf(last.p50) - costOf(last.p5) : 0;
  const spread = last ? costOf(last.p95) - costOf(last.p5) : 0;
  const finalYear = last?.year;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label={`Median budget ${finalYear}`} value={fmtLens(costOf(last?.p50 ?? 0), "cost")} sub="P50 — central estimate" />
        <KpiCard label="Budget at risk (upside)" value={`+${fmtLens(upside, "cost")}`} sub="P95 − P50 — contingency need" />
        <KpiCard label="Potential saving (downside)" value={`−${fmtLens(downside, "cost")}`} sub="P50 − P5 — best case" />
        <KpiCard label="Full P5–P95 spread" value={fmtLens(spread, "cost")} sub={`${finalYear} budget uncertainty`} />
      </div>

      <ChartCard
        title={`${country} — Monte Carlo fan chart (500 simulations)`}
        subtitle={`Lens: ${LENS_META[lens].label} · bands = P5–P95 (light) and P25–P75 (dark), line = median`}
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={fan} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} width={64} tickFormatter={yFmt} domain={["auto", "auto"]} />
            <Tooltip content={(p) => <LensTooltip {...p} lens={lens} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area dataKey="band90" name="P5–P95" stroke="none" fill={C.teal} fillOpacity={0.14} isAnimationActive={false} />
            <Area dataKey="band50" name="P25–P75" stroke="none" fill={C.teal} fillOpacity={0.26} isAnimationActive={false} />
            <Line dataKey="p50" name="Median (P50)" stroke={ink} strokeWidth={2.6} dot={{ r: 2.5 }} isAnimationActive={false} />
            <Line dataKey="p95" name="P95" stroke={C.red} strokeWidth={1.2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            <Line dataKey="p5" name="P5" stroke={C.green} strokeWidth={1.2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Percentile table" subtitle={`Per-year distribution in ${LENS_META[lens].label}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left dark:border-white/[0.06]">
                {["Year", "P5", "P25", "Median", "P75", "P95", "P5–P95 range"].map((h) => (
                  <th key={h} className="px-3 py-2 text-[11px] font-semibold text-zinc-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {fan.map((r, i) => (
                <tr key={r.year} className="border-b border-line last:border-0 dark:border-white/[0.04]">
                  <td className="px-3 py-2 font-semibold text-navy dark:text-white">{years[i]}</td>
                  <td className="px-3 py-2 text-green-700 dark:text-green-400">{fmtLens(r.p5, lens, false)}</td>
                  <td className="px-3 py-2 text-zinc-500">{fmtLens(r.p25, lens, false)}</td>
                  <td className="px-3 py-2 font-semibold text-navy dark:text-white">{fmtLens(r.p50, lens, false)}</td>
                  <td className="px-3 py-2 text-zinc-500">{fmtLens(r.p75, lens, false)}</td>
                  <td className="px-3 py-2 text-red-600 dark:text-red-400">{fmtLens(r.p95, lens, false)}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{fmtLens(r.p95 - r.p5, lens, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
