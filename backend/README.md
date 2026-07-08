# Gavi MCV1 Coverage Forecasting

Forecasts annual **MCV1 (Measles-Containing Vaccine dose 1) procurement targets** for
Gavi/UNICEF-supported countries (Kyrgyzstan, Lesotho, Uzbekistan) out to 2030, and
renders them in a business-facing dashboard with a **US$ procurement-budget** view.

## What the target means (important)
`MCV1_TARGET` is **not a coverage percentage** — it is the **annual number of MCV1
doses (in thousands)** and it already includes a **25% wastage allowance**:

```
MCV1_TARGET = Pop_Age_0 × coverage ÷ 0.75
```

The dashboard derives three lenses from this single quantity (no hard-coded values):

```
children_covered = MCV1_TARGET × 0.75                 # wastage-invariant
doses(w)         = children_covered ÷ (1 − w)         # w = UI wastage slider, 0–50%
cost (US$)       = doses × 1000 × 0.318                # Gavi/UNICEF 10-dose price
coverage %       = children_covered ÷ Pop_Age_0 × 100 # may slightly exceed 100 in forecast
```

At the default `w = 25%`, `doses = MCV1_TARGET` exactly (reproduces the published figures).

## Pipeline
`backend/generate_data.py` is the **single source of truth**. It reads
`vaccine_data.csv` (WHO/UNICEF MCV1 + UN WPP demographics) and
`future_demographics.csv` (UN medium-variant 2025–2030), trains the model
(`mcv1_forecast/core.py`), runs all engines, and writes `frontend/public/data.json`.

Engines: baseline forecast · walk-forward backtest (per-country MAPE) ·
Monte Carlo (500 sims, P5–P95) · scenarios (baseline/optimistic/pessimistic/pandemic) ·
sensitivity (tornado + elasticity).

```bash
cd backend
python generate_data.py     # -> ../frontend/public/data.json
```

## Dashboard
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # static bundle in dist/
```

Four pages, US$-first, with a global country selector, US$/Doses lens toggle, and a
0–50% wastage slider that recomputes cost & demand live:
1. **Overview** — KPIs, past→forecast + Monte-Carlo fan, scenario budget range, model reliability.
2. **Forecast & Demographics** — history→forecast, per-year detail table, demographic drivers.
3. **Uncertainty (Monte Carlo)** — P5–P95 fan, budget-at-risk.
4. **Scenarios & Sensitivity** — scenario planner (cohort + coverage levers), tornado + elasticity.

## Model
Huber Regressor (robust to outliers) + StandardScaler, ~32 engineered features
(lags, rolling means, YoY growth, mortality ratios, country dummies), TimeSeries
CV, walk-forward retraining in backtest. Recomputed backtest accuracy is reported
live in the dashboard's *Model reliability* panel.

See [../documentation](../documentation) for full technical and business documentation.
