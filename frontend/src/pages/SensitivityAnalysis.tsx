import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, LineChart, Line, ResponsiveContainer,
} from 'recharts'
import { TORNADO_DATA, FEATURE_IMPORTANCE, ELASTICITY_DATA, Country } from '../data'

const COUNTRIES = ['Kyrgyzstan', 'Lesotho', 'Uzbekistan']
const YEARS = ['2025', '2026', '2027', '2028', '2029', '2030']

function TornadoBar({ data }: { data: any[] }) {
  // Build recharts-friendly data: one entry per feature, with pos/neg values
  const chartData = data.map(d => ({
    feature: d.feature,
    pos: d.pos,
    neg: Math.abs(d.neg),
    negRaw: d.neg,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 150, right: 60, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" horizontal={false} />
        <XAxis
          type="number"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          tickLine={false}
          tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
          domain={[-1, 1]}
        />
        <YAxis
          type="category"
          dataKey="feature"
          stroke="none"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          width={148}
        />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
          formatter={(v: any, name: any) => [
            name === 'pos' ? `+${v.toFixed(2)}%` : `-${v.toFixed(2)}%`,
            name === 'pos' ? '+5% input' : '−5% input',
          ]}
        />
        <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
        <Bar dataKey="pos" fill="#3498db" radius={[0, 4, 4, 0]}
          label={{ position: 'right', fill: 'var(--text-secondary)', fontSize: 10, formatter: (v: any) => `+${v.toFixed(1)}%` }}
        />
        <Bar dataKey="neg" fill="#e74c3c" radius={[4, 0, 0, 4]}
          label={{ position: 'left', fill: 'var(--text-secondary)', fontSize: 10, formatter: (v: any) => `-${v.toFixed(1)}%` }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

const IMPACT_COLORS: Record<string, string> = {
  HIGH: 'var(--red)',
  MEDIUM: '#f39c12',
  LOW: 'var(--green)',
}

export default function SensitivityAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState<Country>('Kyrgyzstan')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedFeature, setSelectedFeature] = useState('Births')

  const tornado = TORNADO_DATA[selectedCountry] || []
  const importance = FEATURE_IMPORTANCE[selectedCountry] || []
  const elasticityMap = ELASTICITY_DATA[selectedCountry] || {}
  const features = Object.keys(elasticityMap)
  const currentElasticity = elasticityMap[selectedFeature] || (features.length > 0 ? elasticityMap[features[0]] : [])
  const maxScore = Math.max(...importance.map((f: any) => f.score), 0.1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="label">Country</span>
        <select className="pill-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value as Country)}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="label" style={{ marginLeft: 8 }}>Year</span>
        <select className="pill-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Tornado */}
      <div className="card">
        <div className="chart-title">Sensitivity Tornado — {selectedCountry} ({selectedYear})</div>
        <div className="chart-subtitle">Impact of ±5% perturbation on each demographic input</div>
        <TornadoBar data={tornado} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Elasticity curve */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="chart-title">Elasticity Curve</div>
            <select className="pill-select" style={{ fontSize: 11, padding: '3px 10px' }} value={selectedFeature} onChange={e => setSelectedFeature(e.target.value)}>
              {features.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="chart-subtitle">How does changing this input affect the forecast?</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={currentElasticity} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
              <XAxis
                dataKey="x"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                label={{ value: '% Change in Feature', position: 'insideBottom', offset: -2, fill: 'var(--text-secondary)', fontSize: 10 }}
              />
              <YAxis
                stroke="none"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                label={{ value: '% Change in Forecast', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any) => [`${v.toFixed(2)}%`, 'MCV1 change']}
                labelFormatter={v => `Input: ${v}%`}
              />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="y" stroke="var(--green)" strokeWidth={2} dot={false} name="Response" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature importance */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 16 }}>Feature Impact Ranking</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {importance.map((f: any, i: number) => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 20, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ width: 110, fontSize: 13, color: 'var(--text-primary)', flexShrink: 0 }}>{f.name}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(f.score / maxScore) * 100}%`,
                    background: IMPACT_COLORS[f.impact],
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: `${IMPACT_COLORS[f.impact]}20`,
                  color: IMPACT_COLORS[f.impact],
                  flexShrink: 0, width: 80, textAlign: 'center',
                }}>
                  {f.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
