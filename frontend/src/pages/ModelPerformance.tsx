import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  Area, ComposedChart, ResponsiveContainer, Line
} from 'recharts'
import { COUNTRIES, COUNTRY_COLORS, COUNTRY_FLAGS, BACKTEST, type Country, computeCountryMAPE, computeOverallMAPE, computeOverallAccuracy } from '../data'

// Circular progress ring
function RingCard({ label, mape, accuracy, ringColor }: {
  label: string; mape: string; accuracy: number; ringColor: string
}) {
  const r = 36, cx = 44, cy = 44, circumference = 2 * Math.PI * r
  const stroke = circumference * (1 - accuracy / 100)
  return (
    <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <span className="label">{label}</span>
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={ringColor} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={stroke}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: ringColor, lineHeight: 1 }}>{accuracy.toFixed(1)}%</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>accuracy</span>
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{mape}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>MAPE</div>
    </div>
  )
}

function BacktestChart({ country }: { country: Country }) {
  const data = BACKTEST[country]
  const color = COUNTRY_COLORS[country]
  const mape = computeCountryMAPE(country)

  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ marginBottom: 10 }}>
        <div className="chart-title">{COUNTRY_FLAGS[country]} {country}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>MAPE: {mape.toFixed(2)}%</div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`gap-${country}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} />
          <YAxis stroke="none" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}K`} />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
            formatter={(v: any, name: any) => [`${v?.toFixed(1)}K`, name]}
          />
          <Area type="monotone" dataKey="predicted" stroke="none" fill={`url(#gap-${country})`} fillOpacity={1} name="" legendType="none" />
          <Line dataKey="actual" name="Actual" stroke="var(--gray-line)" strokeWidth={2} dot={{ r: 4, fill: 'var(--gray-line)' }} />
          <Line dataKey="predicted" name="Predicted" stroke={color} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: color }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

const PIPELINE = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
    title: 'DATA',
    desc: '25 years of demographic data, UN population projections for 3 countries',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'FEATURES',
    desc: '17 engineered features including lagged values, rolling means, growth rates, mortality ratios',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.5">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    title: 'MODEL',
    desc: 'Huber Regressor — robust to outliers, standardized inputs, TimeSeries cross-validation',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'VALIDATION',
    desc: '3-fold TimeSeries CV, MAE: 56.2, recursive backtest 2020–2024',
  },
]

export default function ModelPerformance() {
  const overallMape = computeOverallMAPE()
  const overallAcc = computeOverallAccuracy()
  const kgMape = computeCountryMAPE('Kyrgyzstan')
  const lsMape = computeCountryMAPE('Lesotho')
  const uzMape = computeCountryMAPE('Uzbekistan')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Accuracy KPI cards */}
      <div style={{ display: 'flex', gap: 14 }}>
        <RingCard label="OVERALL MAPE" mape={`${overallMape.toFixed(2)}%`} accuracy={overallAcc} ringColor="var(--green)" />
        <RingCard label="KYRGYZSTAN MAPE" mape={`${kgMape.toFixed(2)}%`} accuracy={100 - kgMape} ringColor="var(--green)" />
        <RingCard label="LESOTHO MAPE" mape={`${lsMape.toFixed(2)}%`} accuracy={100 - lsMape} ringColor="#f39c12" />
        <RingCard label="UZBEKISTAN MAPE" mape={`${uzMape.toFixed(2)}%`} accuracy={100 - uzMape} ringColor="#f39c12" />
      </div>

      {/* Backtest charts */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 16 }}>Model Backtest: Actual vs Predicted (2020–2024)</div>
        <div style={{ display: 'flex', gap: 14 }}>
          {COUNTRIES.map(c => <BacktestChart key={c} country={c} />)}
        </div>
      </div>

      {/* Methodology pipeline */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 20 }}>Methodology Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {PIPELINE.map((step, i) => (
            <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 180 }}>{step.desc}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div style={{
                  flexShrink: 0, marginTop: 26, display: 'flex', alignItems: 'center',
                }}>
                  <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polyline points="3,2 7,5 3,8" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
