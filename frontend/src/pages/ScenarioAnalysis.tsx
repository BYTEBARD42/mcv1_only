import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, COUNTRY_FLAGS, getScenarios, getHistoricalSeries, type Country } from '../data'

const SCENARIOS = [
  { key: 'baseline', label: 'BASELINE', color: '#3498db', desc: 'UN medium-variant projections, no adjustments' },
  { key: 'optimistic', label: 'OPTIMISTIC', color: '#2ecc71', desc: 'Strong health system, declining mortality (IMR ×0.85, Births ×1.02)' },
  { key: 'pessimistic', label: 'PESSIMISTIC', color: '#e74c3c', desc: 'Health system stress, rising mortality (IMR ×1.15, Births ×0.95)' },
  { key: 'pandemic', label: 'PANDEMIC SHOCK', color: '#9b59b6', desc: 'COVID-like disruption (Migration ×0.3, Births ×0.97)' },
]

const FORECAST_YEARS = [2025, 2026, 2027, 2028, 2029, 2030]

function buildScenarioChart(country: Country) {
  const scenarios = getScenarios(country)
  const histSeries = getHistoricalSeries(country).filter(d => d.year >= 2020 && d.year <= 2024)

  const histPts = histSeries.map((d: any) => ({
    year: d.year,
    hist: d.value,
    baseline: null as number | null,
    optimistic: null as number | null,
    pessimistic: null as number | null,
    pandemic: null as number | null,
  }))

  const forecastPts = FORECAST_YEARS.map((y, i) => ({
    year: y,
    hist: null as number | null,
    baseline: scenarios.baseline[i],
    optimistic: scenarios.optimistic[i],
    pessimistic: scenarios.pessimistic[i],
    pandemic: scenarios.pandemic[i],
  }))

  return [...histPts, ...forecastPts]
}

function ScenarioChart({ country }: { country: Country }) {
  const data = buildScenarioChart(country)
  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div className="chart-title">{COUNTRY_FLAGS[country]} {country}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Scenario Forecast 2020–2030</div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔍 Drag to zoom</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} />
          <YAxis stroke="none" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} tickFormatter={v => `${v?.toFixed(0)}K`} />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
            formatter={(v: any, name: any) => [`${v?.toFixed(1)}K`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <ReferenceLine x={2024} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Line dataKey="hist" name="Historical" stroke="var(--gray-line)" strokeWidth={2} dot={false} connectNulls />
          {SCENARIOS.map(s => (
            <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} connectNulls strokeDasharray={s.key !== 'baseline' ? '5 3' : undefined} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function buildImpactRow(country: Country) {
  const s = getScenarios(country)
  const base = s.baseline[5]
  const opt = s.optimistic[5]
  const pes = s.pessimistic[5]
  const pan = s.pandemic[5]
  const optDelta = ((opt - base) / base * 100).toFixed(1)
  const pesDelta = ((pes - base) / base * 100).toFixed(1)
  const panDelta = ((pan - base) / base * 100).toFixed(1)
  return { country, base, opt, pes, pan, optDelta, pesDelta, panDelta }
}

export default function ScenarioAnalysis() {
  const impactRows = COUNTRIES.map(buildImpactRow)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Scenario legend cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {SCENARIOS.map(s => (
          <div key={s.key} className="glass" style={{
            padding: '14px 16px',
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Scenario charts */}
      <div style={{ display: 'flex', gap: 14 }}>
        {COUNTRIES.map(c => <ScenarioChart key={c} country={c} />)}
      </div>

      {/* Impact table */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 16 }}>Scenario Impact Summary (2030 MCV2 Forecast)</div>
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Baseline</th>
              <th>Optimistic</th>
              <th>Pessimistic</th>
              <th>Pandemic</th>
              <th>Best Case Δ</th>
              <th>Worst Case Δ</th>
            </tr>
          </thead>
          <tbody>
            {impactRows.map(row => (
              <tr key={row.country}>
                <td style={{ fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COUNTRY_COLORS[row.country], flexShrink: 0 }} />
                  {row.country}
                </td>
                <td>{row.base.toFixed(1)}K</td>
                <td>{row.opt.toFixed(1)}K</td>
                <td>{row.pes.toFixed(1)}K</td>
                <td>{row.pan.toFixed(1)}K</td>
                <td style={{ color: 'var(--green)', fontWeight: 600 }}>+{row.optDelta}%</td>
                <td style={{ color: 'var(--red)', fontWeight: 600 }}>{row.pesDelta}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
