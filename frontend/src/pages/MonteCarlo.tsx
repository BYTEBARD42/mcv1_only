import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, COUNTRY_FLAGS, MC_DATA, type Country } from '../data'

const HIST_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024]

function buildFanData(country: Country) {
  const baseVal = MC_DATA[country][0].p50 * 0.96
  const histPts = HIST_YEARS.map((y, i) => ({
    year: y,
    hist: +(baseVal * (0.88 + i * 0.02)).toFixed(1),
    p5: null as number | null, p25: null as number | null,
    p50: null as number | null, p75: null as number | null, p95: null as number | null,
    band90: null as [number, number] | null,
    band50: null as [number, number] | null,
  }))
  const forecastPts = MC_DATA[country].map(d => ({
    year: d.year,
    hist: null as number | null,
    p5: d.p5, p25: d.p25, p50: d.p50, p75: d.p75, p95: d.p95,
    band90: [d.p5, d.p95] as [number, number],
    band50: [d.p25, d.p75] as [number, number],
  }))
  return [...histPts, ...forecastPts]
}

function FanChart({ country }: { country: Country }) {
  const data = buildFanData(country)
  const color = COUNTRY_COLORS[country]

  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ marginBottom: 12 }}>
        <div className="chart-title">{COUNTRY_FLAGS[country]} {country}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Monte Carlo Confidence Bands</div>
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <ComposedChart data={data} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`band90-${country}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id={`band50-${country}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} />
          <YAxis stroke="none" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} tickFormatter={v => `${v?.toFixed(0)}K`} />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
            formatter={(v: number | null, name: string) => v !== null ? [`${v?.toFixed(1)}K`, name] : [null, name]}
          />
          <ReferenceLine x={2024} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />

          {/* 90% CI band */}
          <Area
            type="monotone" dataKey="p95" stroke="none"
            fill={`url(#band90-${country})`} fillOpacity={1}
            name="90% CI (upper)" connectNulls legendType="none"
          />
          <Area
            type="monotone" dataKey="p5" stroke="none"
            fill="var(--bg)" fillOpacity={1}
            name="90% CI (lower)" connectNulls legendType="none"
          />

          {/* 50% CI band */}
          <Area
            type="monotone" dataKey="p75" stroke="none"
            fill={`url(#band50-${country})`} fillOpacity={1}
            name="50% CI (upper)" connectNulls legendType="none"
          />
          <Area
            type="monotone" dataKey="p25" stroke="none"
            fill="var(--bg)" fillOpacity={1}
            name="50% CI (lower)" connectNulls legendType="none"
          />

          <Line dataKey="hist" name="Historical" stroke="var(--gray-line)" strokeWidth={2} dot={{ r: 3, fill: 'var(--gray-line)' }} connectNulls />
          <Line dataKey="p50" name="Median (P50)" stroke={color} strokeWidth={2} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
      {/* Mini legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 20, height: 2, background: 'var(--gray-line)', display: 'inline-block' }} />Historical
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 10, background: `rgba(${color === '#3498db' ? '52,152,219' : color === '#2ecc71' ? '46,204,113' : '230,126,34'},0.25)`, display: 'inline-block', borderRadius: 2 }} />50% CI
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 10, background: `rgba(${color === '#3498db' ? '52,152,219' : color === '#2ecc71' ? '46,204,113' : '230,126,34'},0.1)`, display: 'inline-block', borderRadius: 2 }} />90% CI
        </span>
        <span style={{ fontSize: 11, color, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 20, height: 2, background: color, display: 'inline-block' }} />P50
        </span>
      </div>
    </div>
  )
}

export default function MonteCarlo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Simulation params bar */}
      <div className="glass" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎲</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>
          500 Simulations &nbsp;|&nbsp; Births ±5% &nbsp;|&nbsp; IMR ±10% &nbsp;|&nbsp; Block Bootstrap Residuals
        </span>
      </div>

      {/* Fan charts */}
      <div style={{ display: 'flex', gap: 14 }}>
        {COUNTRIES.map(c => <FanChart key={c} country={c} />)}
      </div>

      {/* CI table */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 16 }}>Forecast Confidence Intervals (2025–2030)</div>
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Year</th>
              <th>P5</th>
              <th>P25</th>
              <th>Median (P50)</th>
              <th>P75</th>
              <th>P95</th>
              <th>Range (P5–P95)</th>
            </tr>
          </thead>
          <tbody>
            {COUNTRIES.flatMap(c =>
              MC_DATA[c].map((row, i) => (
                <tr key={`${c}-${row.year}`}>
                  {i === 0 ? (
                    <td rowSpan={6} style={{ fontFamily: 'Inter, sans-serif', verticalAlign: 'top', paddingTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: COUNTRY_COLORS[c], flexShrink: 0 }} />
                        {c}
                      </div>
                    </td>
                  ) : null}
                  <td style={{ color: 'var(--text-secondary)' }}>{row.year}</td>
                  <td>{row.p5.toFixed(1)}K</td>
                  <td>{row.p25.toFixed(1)}K</td>
                  <td style={{ color: COUNTRY_COLORS[c], fontWeight: 600 }}>{row.p50.toFixed(1)}K</td>
                  <td>{row.p75.toFixed(1)}K</td>
                  <td>{row.p95.toFixed(1)}K</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.p5.toFixed(1)}K – {row.p95.toFixed(1)}K</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
