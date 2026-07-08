import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, COUNTRY_FLAGS, type Country, getCombinedChartData, FORECAST_BASELINE, FORECAST_YEARS, BACKTEST, getOverviewKPIs } from '../data'

function KpiCard({ label, value, sub, subColor, icon, accentColor }: {
  label: string; value: string; sub: string; subColor: string; icon: React.ReactNode; accentColor: string
}) {
  return (
    <div className="glass" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: accentColor }}>{icon}</span>
        <span className="label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div style={{ fontSize: 13, color: subColor, fontWeight: 500 }}>{sub}</div>
    </div>
  )
}

// Sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 60, h = 20
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Build single-country chart data
function buildCountryData(country: Country) {
  const data = getCombinedChartData(country)
  const bt = BACKTEST[country] || []

  return data.map(d => {
    const b = bt.find(x => x.year === d.year)
    return {
      year: d.year,
      hist: d.hist,
      forecast: d.forecast,
      backtest: b ? b.predicted : null,
    }
  })
}

export default function ExecutiveOverview() {
  const [country, setCountry] = useState<Country>('Kyrgyzstan')
  const chartData = buildCountryData(country)
  const color = COUNTRY_COLORS[country]

  const forecastSummary = COUNTRIES.map(c => {
    const vals = FORECAST_BASELINE[c]
    return { country: c, values: vals, sparkData: vals }
  })

  const { totalBirths2025, forecast2025, forecast2030, pctChange } = getOverviewKPIs()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Row 1: KPI cards */}
      <div style={{ display: 'flex', gap: 14 }}>
        <KpiCard
          label="Total Births (2025)"
          value={totalBirths2025.toLocaleString('en-US')}
          sub="Projected sum"
          subColor="var(--green)"
          accentColor="var(--green)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
        />
        <KpiCard
          label="MCV1 Forecast (2025)"
          value={`${forecast2025.toFixed(1)}K`}
          sub="● Baseline projection"
          subColor="var(--blue)"
          accentColor="var(--blue)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2v2m4-2v2M5 10h14M5 10a7 7 0 0014 0M5 10a7 7 0 000 10h14a7 7 0 000-10"/></svg>}
        />
        <KpiCard
          label="MCV1 Forecast (2030)"
          value={`${forecast2030.toFixed(1)}K`}
          sub="● End-period projection"
          subColor="var(--orange)"
          accentColor="var(--orange)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>}
        />
        <KpiCard
          label="5-Year Change"
          value={`${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%`}
          sub={pctChange > 0 ? '↑ Growth by 2030' : '↓ Declining trend by 2030'}
          subColor={pctChange > 0 ? 'var(--green)' : 'var(--red)'}
          accentColor={pctChange > 0 ? 'var(--green)' : 'var(--red)'}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
        />
      </div>

      {/* Row 2: Main chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div className="chart-title">Historical & Forecasted MCV1 Targets (in thousands)</div>
            <div className="chart-subtitle">Solid = historical &nbsp;·&nbsp; Dashed = forecast (2025–2030) &nbsp;·&nbsp; Dotted = walk-forward (2020-2024)</div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
            {COUNTRIES.map(c => (
              <button
                key={c}
                className={`tab-btn${country === c ? ' active' : ''}`}
                onClick={() => setCountry(c)}
                style={{ padding: '6px 12px', fontSize: 13 }}
              >
                {COUNTRY_FLAGS[c]} {c}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
            <XAxis
              dataKey="year"
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickLine={false}
              ticks={[2000, 2005, 2010, 2015, 2020, 2025, 2030]}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}`}
            />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              formatter={(v: any, name: any) => [`${v?.toFixed(1)}K`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="circle"
            />
            <ReferenceLine x={2024} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: 'Forecast →', position: 'top', fill: 'var(--text-secondary)', fontSize: 11 }} />

            <Line dataKey="hist" name="Historical" stroke="var(--gray-line)" strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="forecast" name="Forecast" stroke={color} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
            <Line dataKey="backtest" name="WF Val" stroke={color} strokeWidth={2} strokeDasharray="1 3" dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Summary table */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 16 }}>Forecast Summary (MCV1 Target in thousands)</div>
        <table>
          <thead>
            <tr>
              <th>Country</th>
              {FORECAST_YEARS.map(y => <th key={y}>{y}</th>)}
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {forecastSummary.map(row => (
              <tr key={row.country}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COUNTRY_COLORS[row.country as keyof typeof COUNTRY_COLORS], flexShrink: 0 }} />
                  {row.country}
                </td>
                {row.values.map((v, i) => (
                  <td key={i}>{v.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                ))}
                <td>
                  <Sparkline data={row.sparkData} color={COUNTRY_COLORS[row.country as keyof typeof COUNTRY_COLORS]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
