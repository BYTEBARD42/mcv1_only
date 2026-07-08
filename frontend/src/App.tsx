import React, { useState, useEffect } from 'react'
import { loadDashboardData, computeOverallAccuracy } from './data'
import ExecutiveOverview from './pages/ExecutiveOverview'
import CountryDeepDive from './pages/CountryDeepDive'
import ScenarioAnalysis from './pages/ScenarioAnalysis'
import MonteCarlo from './pages/MonteCarlo'
import SensitivityAnalysis from './pages/SensitivityAnalysis'
import ModelPerformance from './pages/ModelPerformance'

type Page = 'overview' | 'country' | 'scenario' | 'monte-carlo' | 'sensitivity' | 'model'

const NAV: { id: Page; icon: React.ReactNode; label: string }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'country',
    label: 'Country',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    id: 'scenario',
    label: 'Scenario',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/>
      </svg>
    ),
  },
  {
    id: 'monte-carlo',
    label: 'Monte Carlo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'sensitivity',
    label: 'Sensitivity',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
      </svg>
    ),
  },
  {
    id: 'model',
    label: 'Model',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('overview')
  const [country, setCountry] = useState('All Countries')

  useEffect(() => {
    loadDashboardData()
      .then(() => setLoading(false))
      .catch(err => {
        console.error('Failed to load dashboard data:', err)
        setError(err.toString())
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--blue)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <h2>Loading Data from Backend...</h2>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        <h2>Error Loading Dashboard</h2>
        <pre>{error}</pre>
      </div>
    )
  }

  const pages: Record<Page, React.ReactNode> = {
    overview: <ExecutiveOverview />,
    country: <CountryDeepDive />,
    scenario: <ScenarioAnalysis />,
    'monte-carlo': <MonteCarlo />,
    sensitivity: <SensitivityAnalysis />,
    model: <ModelPerformance />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 72, flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 20, paddingBottom: 20,
        gap: 8,
      }}>
        {/* Logo */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 0 20px rgba(52,152,219,0.4)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 2a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6A3 3 0 0112 9z"/>
          </svg>
        </div>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            title={n.label}
            style={{
              position: 'relative',
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10,
              background: page === n.id ? 'rgba(52,152,219,0.15)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: page === n.id ? 'var(--blue)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (page !== n.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { if (page !== n.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            {page === n.id && (
              <span style={{
                position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 24, background: 'var(--blue)', borderRadius: '0 3px 3px 0',
              }} />
            )}
            {n.icon}
          </button>
        ))}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 60, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15,15,35,0.95)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Gavi MCV1 Forecast Dashboard
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              className="pill-select"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option>All Countries</option>
              <option>Kyrgyzstan</option>
              <option>Lesotho</option>
              <option>Uzbekistan</option>
            </select>
            <div style={{
              padding: '5px 14px', borderRadius: 20,
              background: 'rgba(52,152,219,0.12)',
              border: '1px solid rgba(52,152,219,0.3)',
              fontSize: 12, color: 'var(--blue)', fontWeight: 500,
              fontFamily: 'DM Mono, monospace',
            }}>
              2025–2030 &nbsp;|&nbsp; Model Accuracy: {computeOverallAccuracy().toFixed(2)}%
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {pages[page]}
        </main>
      </div>
    </div>
  )
}
