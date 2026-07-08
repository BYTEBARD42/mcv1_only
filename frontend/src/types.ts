// Typed schema mirroring backend/generate_data.py -> data.json (v2)

export interface CostConfig {
  pricePerDose: number;   // US$ per dose (Gavi 10-dose measles)
  presentation: string;
  currency: string;
  bakedInWastage: number; // 0.25 -> target = children / 0.75
  defaultWastage: number; // slider default
  source: string;
  note: string;
}

export interface Meta {
  horizon: [number, number];
  modelMAPE: number;
  modelMAE: number;
  backtestMAPE: Record<string, number>;
  targetSemantics: string;
}

export interface YearValue {
  year: number;
  value: number;
}
export interface PopAge0Point {
  year: number;
  popAge0: number;
}
export interface McPoint {
  year: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}
export interface BacktestPoint {
  year: number;
  actual: number;
  predicted: number;
}
export interface TornadoPoint {
  feature: string;
  pos: number;
  neg: number;
}
export interface FeatureImportance {
  name: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  score: number;
}
export interface ElasticityPoint {
  x: number;
  y: number;
}
export interface DemographicTrend {
  year: number;
  pop: number;
  births: number;
  br: number;
  imr: number;
  u5: number;
  mig: number;
}
export interface Demographics {
  totalPopulation: number;
  births2025: number;
  popAge0_2025: number;
  crudeBirthRate: number;
  infantMortalityRate: number;
  under5Mortality: number;
  netMigration: number;
}
export interface CostProjection {
  year: number;
  children: number;
  doses: number;
  costUSD: number;
}
export interface ScenarioMeta {
  label: string;
  color: string;
  description: string;
}

export interface FutureDemographic {
  year: number;
  popAge0: number;
  population: number;
  births: number;
  crudeBirthRate: number;
  infantMortalityRate: number;
  under5Mortality: number;
  netMigration: number;
  netMigrationRate: number;
}

export interface DashboardData {
  meta: Meta;
  costConfig: CostConfig;
  countries: string[];
  historical: Record<string, YearValue[]>;
  forecastBaseline: Record<string, number[]>;
  popAge0: Record<string, PopAge0Point[]>;
  demographics: Record<string, Demographics>;
  demographicTrends: Record<string, DemographicTrend[]>;
  futureDemographics: Record<string, FutureDemographic[]>;
  mcData: Record<string, McPoint[]>;
  scenarios: Record<string, Record<string, number[]>>;
  scenarioMeta: Record<string, ScenarioMeta>;
  tornadoData: Record<string, TornadoPoint[]>;
  featureImportance: Record<string, FeatureImportance[]>;
  elasticityData: Record<string, Record<string, ElasticityPoint[]>>;
  backtest: Record<string, BacktestPoint[]>;
  costProjections: Record<string, CostProjection[]>;
}

export type Lens = "cost" | "doses";
