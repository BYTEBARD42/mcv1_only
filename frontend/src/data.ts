// Historical + forecast data for MCV2 dashboard

export const COUNTRIES = ['Kyrgyzstan', 'Lesotho', 'Uzbekistan'] as const
export type Country = typeof COUNTRIES[number]

export const COUNTRY_FLAGS: Record<Country, string> = {
  Kyrgyzstan: '🇰🇬',
  Lesotho: '🇱🇸',
  Uzbekistan: '🇺🇿',
}

export const COUNTRY_COLORS: Record<Country, string> = {
  Kyrgyzstan: '#3498db',
  Lesotho: '#2ecc71',
  Uzbekistan: '#e67e22',
}

export let FORECAST_BASELINE: Record<Country, number[]> = {} as any;
export let DEMO_DATA: Record<Country, any> = {} as any;
export let MC_DATA: Record<Country, any[]> = {} as any;
export let TORNADO_DATA: Record<Country, any[]> = {} as any;
export let FEATURE_IMPORTANCE: Record<Country, any[]> = {} as any;
export let ELASTICITY_DATA: Record<Country, Record<string, any[]>> = {} as any;
export let BACKTEST: Record<Country, any[]> = {} as any;

let kgHistorical: number[] = [];
let lsHistorical: number[] = [];
let uzHistorical: number[] = [];

export async function loadDashboardData() {
  const dataUrl = `${import.meta.env.BASE_URL}data.json`
  const res = await fetch(dataUrl)
  const data = await res.json()
  
  FORECAST_BASELINE = data.forecastBaseline
  DEMO_DATA = data.demographics
  MC_DATA = data.mcData
  TORNADO_DATA = data.tornadoData
  FEATURE_IMPORTANCE = data.featureImportance
  ELASTICITY_DATA = data.elasticityData
  BACKTEST = data.backtest
  
  kgHistorical = data.historical.Kyrgyzstan.map((d: any) => d.value)
  lsHistorical = data.historical.Lesotho.map((d: any) => d.value)
  uzHistorical = data.historical.Uzbekistan.map((d: any) => d.value)
}

const HIST_START = 2000

export function getHistoricalSeries(country: Country) {
  const data = country === 'Kyrgyzstan' ? kgHistorical : country === 'Lesotho' ? lsHistorical : uzHistorical
  return data.map((v, i) => ({ year: HIST_START + i, value: v }))
}

export const FORECAST_YEARS = [2025, 2026, 2027, 2028, 2029, 2030]

export const SCENARIO_MULTIPLIERS = {
  baseline: { label: 'Baseline', color: '#3498db' },
  optimistic: { label: 'Optimistic', color: '#2ecc71' },
  pessimistic: { label: 'Pessimistic', color: '#e74c3c' },
  pandemic: { label: 'Pandemic', color: '#9b59b6' },
}

function applyScenario(base: number[], mult: number[]) {
  return base.map((v, i) => +(v * mult[i]).toFixed(1))
}

const optMult = [1.02, 1.035, 1.05, 1.065, 1.08, 1.095]
const pesMult = [0.95, 0.94, 0.93, 0.92, 0.91, 0.90]
const panMult = [0.97, 0.96, 0.955, 0.95, 0.945, 0.94]

export function getScenarios(country: Country) {
  const base = FORECAST_BASELINE[country]
  return {
    baseline: base,
    optimistic: applyScenario(base, optMult),
    pessimistic: applyScenario(base, pesMult),
    pandemic: applyScenario(base, panMult),
  }
}

// Full time series for overview chart (2000-2030)
export function getFullSeries(country: Country) {
  const hist = getHistoricalSeries(country)
  const base = FORECAST_BASELINE[country]
  const forecastPts = FORECAST_YEARS.map((y, i) => ({ year: y, value: base[i] }))
  return { historical: hist, forecast: forecastPts }
}

// Combined for recharts (with nulls to split lines)
export function getCombinedChartData(country: Country) {
  const { historical, forecast } = getFullSeries(country)
  const histMap: Record<number, number> = {}
  historical.forEach(h => { histMap[h.year] = h.value })

  const years = Array.from({ length: 31 }, (_, i) => 2000 + i)
  return years.map(year => ({
    year,
    hist: histMap[year] ?? null,
    forecast: year >= 2025 ? (forecast.find(f => f.year === year)?.value ?? null) : null,
    // bridge point
    histBridge: year === 2024 ? histMap[2024] : null,
  }))
}
