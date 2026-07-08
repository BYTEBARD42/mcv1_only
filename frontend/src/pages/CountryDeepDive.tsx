import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, ReferenceLine,
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, COUNTRY_FLAGS, DEMO_DATA, FORECAST_BASELINE, FORECAST_YEARS, DEMO_TRENDS, getHistoricalSeries, type Country } from '../data'

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

function DemoCard({ label, value, sparkData, color }: { label: string; value: string; sparkData: number[]; color: string }) {
  return (
    <div className="glass" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  )
}

function buildCountryForecastChart(country: Country) {
  const base = FORECAST_BASELINE[country]
  const histSeries = getHistoricalSeries(country).slice(-10) // last 10 years

  const histData = histSeries.map((d: any) => ({
    year: d.year,
    hist: d.value,
    forecast: null as number | null,
  }))

  const forecastData = FORECAST_YEARS.map((y, i) => ({
    year: y,
    hist: null as number | null,
    forecast: base[i],
  }))
  return [...histData, ...forecastData]
}

function buildDemoTrend(country: Country, metric: string) {
  const trends = DEMO_TRENDS[country] || []
  return trends.map((t: any) => ({
    year: t.year,
    value: t[metric]
  }))
}

export default function CountryDeepDive() {
  const [country, setCountry] = useState<Country>('Kyrgyzstan')
  const demo = DEMO_DATA[country]
  const color = COUNTRY_COLORS[country]
  const chartData = buildCountryForecastChart(country)
  const ageDist = demo.ageDistribution2025
  const trends = DEMO_TRENDS[country] || []
  const recentTrends = trends.slice(-6)

  const demoCards = [
    { label: 'Total Population', value: demo.totalPopulation.toLocaleString(), sparkData: recentTrends.map((t: any) => t.pop / 1e6) },
    { label: 'Births (2025)', value: demo.births2025.toLocaleString(), sparkData: recentTrends.map((t: any) => t.births / 1e3) },
    { label: 'Crude Birth Rate', value: `${demo.crudeBirthRate} per 1,000`, sparkData: recentTrends.map((t: any) => t.br) },
    { label: 'Infant Mortality Rate', value: `${demo.infantMortalityRate} per 1,000`, sparkData: recentTrends.map((t: any) => t.imr) },
    { label: 'Under-5 Mortality', value: `${demo.under5Mortality} per 1,000`, sparkData: recentTrends.map((t: any) => t.u5) },
    { label: 'Net Migration', value: `${demo.netMigration > 0 ? '+' : ''}${demo.netMigration.toLocaleString()}`, sparkData: recentTrends.map((t: any) => t.mig) },
  ]

  const trendMinis = [
    { title: 'Total Population', data: buildDemoTrend(country, 'pop') },
    { title: 'Births', data: buildDemoTrend(country, 'births') },
    { title: 'Birth Rate', data: buildDemoTrend(country, 'br') },
    { title: 'Infant Mortality Rate', data: buildDemoTrend(country, 'imr') },
    { title: 'Under-5 Mortality', data: buildDemoTrend(country, 'u5') },
    { title: 'Net Migration', data: buildDemoTrend(country, 'mig') },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Country tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {COUNTRIES.map(c => (
          <button
            key={c}
            className={`tab-btn${country === c ? ' active' : ''}`}
            onClick={() => setCountry(c)}
          >
            {COUNTRY_FLAGS[c]} {c}
          </button>
        ))}
      </div>

      {/* Demographic cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {demoCards.map(card => (
          <DemoCard key={card.label} {...card} color={color} />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Age distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="chart-title">Population Age Distribution (2025)</div>
            <select className="pill-select" style={{ fontSize: 12, padding: '4px 12px' }}>
              <option>Year: 2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageDist} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} />
              <YAxis type="category" dataKey="age" stroke="none" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={44} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v.toFixed(1)}K`, 'Population']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}
                fill={color}
                label={{ position: 'right', fill: 'var(--text-secondary)', fontSize: 10, formatter: (v: any) => `${v.toFixed(1)}K` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast trajectory */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 4 }}>MCV2 Forecast Trajectory</div>
          <div className="chart-subtitle">2015–2030 &nbsp;·&nbsp; solid = historical, dashed = forecast</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
              <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} />
              <YAxis stroke="none" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}K`} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v?.toFixed(1)}K`, '']}
              />
              <ReferenceLine x={2024} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Line dataKey="hist" stroke="var(--gray-line)" strokeWidth={2} dot={{ r: 3, fill: 'var(--gray-line)' }} connectNulls name="Historical" />
              <Line dataKey="forecast" stroke={color} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: color }} connectNulls name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini trend charts */}
      <div>
        <div className="chart-title" style={{ marginBottom: 14 }}>Demographic Trends (2000–2024)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {trendMinis.map(mini => (
            <div key={mini.title} className="glass" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{mini.title}</div>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={mini.data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`mini-${mini.title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} ticks={[2000, 2010, 2020, 2024]} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#mini-${mini.title})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
