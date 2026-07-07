import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer, Brush
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, getCombinedChartData, FORECAST_BASELINE, FORECAST_YEARS, BACKTEST } from '../data'

function KpiCard({ label, value, sub, subColor, icon, accentColor }: {
  label: string; value: string; sub: string; subColor: string; icon: JSX.Element; accentColor: string
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

// Build multi-country chart data
function buildOverviewData() {
  const kgData = getCombinedChartData('Kyrgyzstan')
  const lsData = getCombinedChartData('Lesotho')
  const uzData = getCombinedChartData('Uzbekistan')

  const kgBt = BACKTEST['Kyrgyzstan'] || []
  const lsBt = BACKTEST['Lesotho'] || []
  const uzBt = BACKTEST['Uzbekistan'] || []

  return kgData.map((d, i) => {
    const kgB = kgBt.find(b => b.year === d.year)
    const lsB = lsBt.find(b => b.year === d.year)
    const uzB = uzBt.find(b => b.year === d.year)

    return {
      year: d.year,
      kgHist: d.hist,
      kgForecast: d.forecast,
      kgBacktest: kgB ? kgB.predicted : null,
      lsHist: lsData[i].hist,
      lsForecast: lsData[i].forecast,
      lsBacktest: lsB ? lsB.predicted : null,
      uzHist: uzData[i].hist,
      uzForecast: uzData[i].forecast,
      uzBacktest: uzB ? uzB.predicted : null,
    }
  })
}

export default function ExecutiveOverview() {
  const [yMax, setYMax] = useState<number>(1300)
  const chartData = buildOverviewData()

  const forecastSummary = COUNTRIES.map(c => {
    const vals = FORECAST_BASELINE[c]
    return { country: c, values: vals, sparkData: vals }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Row 1: KPI cards */}
      <div style={{ display: 'flex', gap: 14 }}>
        <KpiCard
          label="Total Births (2025)"
          value="1,920,739"
          sub="↑ +2.1% vs 2024"
          subColor="var(--green)"
          accentColor="var(--green)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
        />
        <KpiCard
          label="MCV2 Forecast (2025)"
          value="1,085,910"
          sub="● Baseline projection"
          subColor="var(--blue)"
          accentColor="var(--blue)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2v2m4-2v2M5 10h14M5 10a7 7 0 0014 0M5 10a7 7 0 000 10h14a7 7 0 000-10"/></svg>}
        />
        <KpiCard
          label="MCV2 Forecast (2030)"
          value="974,136"
          sub="● End-period projection"
          subColor="var(--orange)"
          accentColor="var(--orange)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>}
        />
        <KpiCard
          label="5-Year Change"
          value="-10.3%"
          sub="↓ Declining trend by 2030"
          subColor="var(--red)"
          accentColor="var(--red)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
        />
      </div>

      {/* Row 2: Main chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div className="chart-title">Historical & Forecasted MCV2 Targets (in thousands)</div>
            <div className="chart-subtitle">Solid = historical &nbsp;·&nbsp; Dashed = forecast (2025–2030) &nbsp;·&nbsp; Dotted = walk-forward (2020-2024)</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>↕ Y-Axis Zoom: </span>
            <input 
              type="range" 
              min={50} max={1500} step={50} 
              value={yMax} 
              onChange={e => setYMax(Number(e.target.value))}
              style={{ width: 100, accentColor: 'var(--blue)' }}
            />
            <span style={{ fontSize: 12, width: 40, fontFamily: 'monospace' }}>{yMax}k</span>
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
              domain={[0, yMax]}
              allowDataOverflow={true}
            />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              formatter={(v: number, name: string) => [`${v?.toFixed(1)}K`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="circle"
            />
            <ReferenceLine x={2024} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: 'Forecast →', position: 'top', fill: 'var(--text-secondary)', fontSize: 11 }} />

            <Line dataKey="kgHist" name="Kyrgyzstan" stroke={COUNTRY_COLORS['Kyrgyzstan']} strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="kgForecast" name="" stroke={COUNTRY_COLORS['Kyrgyzstan']} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls legendType="none" />
            <Line dataKey="kgBacktest" name="WF Val (Kyrgyzstan)" stroke={COUNTRY_COLORS['Kyrgyzstan']} strokeWidth={2} strokeDasharray="1 3" dot={false} connectNulls legendType="none" />

            <Line dataKey="lsHist" name="Lesotho" stroke={COUNTRY_COLORS['Lesotho']} strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="lsForecast" name="" stroke={COUNTRY_COLORS['Lesotho']} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls legendType="none" />
            <Line dataKey="lsBacktest" name="WF Val (Lesotho)" stroke={COUNTRY_COLORS['Lesotho']} strokeWidth={2} strokeDasharray="1 3" dot={false} connectNulls legendType="none" />

            <Line dataKey="uzHist" name="Uzbekistan" stroke={COUNTRY_COLORS['Uzbekistan']} strokeWidth={2} dot={false} connectNulls />
            <Line dataKey="uzForecast" name="" stroke={COUNTRY_COLORS['Uzbekistan']} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls legendType="none" />
            <Line dataKey="uzBacktest" name="WF Val (Uzbekistan)" stroke={COUNTRY_COLORS['Uzbekistan']} strokeWidth={2} strokeDasharray="1 3" dot={false} connectNulls legendType="none" />
            
            <Brush dataKey="year" height={25} stroke="var(--blue)" fill="rgba(15,15,35,0.8)" tickFormatter={() => ''} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Summary table */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 16 }}>Forecast Summary (MCV2 Target in thousands)</div>
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
