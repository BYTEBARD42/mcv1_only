# MCV1 Forecasting — Technical Documentation

**Scope:** methodology, data sources, assumptions, modelling technique, uncertainty
quantification, and the data contract that drives the dashboard.
**Audience:** data scientists, engineers, and technical reviewers.
**System of record:** [`backend/generate_data.py`](../backend/generate_data.py) (pipeline) and
[`backend/mcv1_forecast/core.py`](../backend/mcv1_forecast/core.py) (model). All figures in
this document are recomputed by the pipeline; where a number appears it reflects the
current committed `data.json`.

---

## 1. Objective

Forecast the **annual MCV1 (Measles-Containing Vaccine, dose 1) procurement target** for three
Gavi/UNICEF-supported countries — **Kyrgyzstan, Lesotho, Uzbekistan** — for **2025–2030**,
with quantified uncertainty and what-if analysis, and expose the result as a static JSON
artifact consumed by a React dashboard.

---

## 2. Data sources

| File | Provenance | Contents | Coverage |
|---|---|---|---|
| [`backend/vaccine_data.csv`](../backend/vaccine_data.csv) | UN **World Population Prospects** (demographics) + **WHO/UNICEF** (MCV1) | 14 columns: population (Jan/Jul), births, crude birth rate, infant & under-5 deaths and rates, net migration (count + rate), `Pop_Age_0`, and `MCV1_TARGET` | 111 rows, 3 countries, **1980–2024** |
| [`backend/future_demographics.csv`](../backend/future_demographics.csv) | UN WPP **medium-variant projections** | Same demographic columns (no MCV1) | 18 rows, 3 countries, **2025–2030** |

No live API or database — the pipeline is fully reproducible from these two CSVs.

### 2.1 The target variable (critical)

`MCV1_TARGET` is **not a coverage percentage**. It is the **number of MCV1 doses required
per year, in thousands**, and it already embeds a **25% wastage allowance** for the 10-dose
vial presentation:

```
MCV1_TARGET = Pop_Age_0 × coverage ÷ 0.75
```

Consequences used throughout the system:
- `MCV1_TARGET / Pop_Age_0 ≈ 1.2–1.32` in 2024 (i.e. "120–132%"), confirming it is a **count**, not a rate.
- Effective coverage is recoverable: `coverage% = MCV1_TARGET × 0.75 ÷ Pop_Age_0 × 100`.
- Procurement cost is a direct multiplication (see §7).

---

## 3. Feature engineering

Implemented in `engineer_features()` ([core.py](../backend/mcv1_forecast/core.py)). The model
consumes **~32 features** grouped as:

**Raw demographics (11):** year, population (Jan & Jul), births, crude birth rate, infant
deaths & IMR, under-5 deaths & U5 mortality, net migrants & migration rate, `Pop_Age_0`.

**Engineered ratios & derived:**
- `Births_per_1000pop`, `Infant_mort_ratio` (= infant deaths / births), `U5_mort_ratio`.
- `Net_migration_abs`, `Years_since_2000`, `is_pandemic_year` (2020–2021 flag).

**Temporal / momentum features (data-leakage-safe — all use `.shift()`):**
- Lags: `MCV1_lag_1`, `MCV1_lag_2`, `MCV1_lag_3`.
- Rolling means: `MCV1_roll3_mean`, `MCV1_roll5_mean`, `Coverage_roll3_mean` (each shifted 1 so only past data is used).
- Rolling std: `MCV1_roll3_std`, `Births_roll3_std`.
- Growth: `MCV1_YoY_growth`, `Births_YoY_growth`, `Population_YoY_growth`.
- First differences: `BirthRate_change`, `InfantMortality_change`.

**Country encoding:** one-hot dummies `Country_Lesotho`, `Country_Uzbekistan` (Kyrgyzstan is the reference level).

Rows without sufficient history (`MCV1_lag_3`, `Births_YoY_growth` NaN) are dropped.

---

## 4. Modelling technique

**Algorithm:** `HuberRegressor(epsilon=1.35, alpha=0.0001, max_iter=2000)` inside a
`sklearn.Pipeline` with `StandardScaler` (`train_model()` in [core.py](../backend/mcv1_forecast/core.py)).

- **Why Huber?** It is robust to outliers via a linear (not quadratic) loss beyond `epsilon`.
  Vaccination series contain shocks (COVID drops, reporting anomalies) that would dominate an
  OLS fit; Huber down-weights them.
- **Scaling:** `StandardScaler` standardises inputs so large-magnitude features (population)
  do not overpower percentage/rate features.
- **Cross-validation:** `TimeSeriesSplit(n_splits=3)` — strictly past→future, no leakage.

### 4.1 Recursive forecasting & walk-forward validation

`recursive_forecast()` operates in two modes:

- **Forecast mode** (`future_demo_df` supplied): a **single fixed model** (trained on all data
  `< 2025`) predicts 2025→2030 one year at a time. Each prediction is **fed back** as the lag
  input for the next year, so multi-step compounding is represented.
- **Backtest mode** (`future_demo_df=None`): **walk-forward retraining** — for each target year
  *Y*, a fresh model is trained on all actual data strictly before *Y*, predicts *Y*, then the
  prediction is fed back. This measures true out-of-sample multi-step accuracy.

---

## 5. Model performance (walk-forward backtest, 2020–2024)

Recomputed by the current pipeline:

| Metric | Value |
|---|---|
| Overall MAPE | **2.68%** |
| Overall MAE | **5.28** (thousand doses) |
| Kyrgyzstan MAPE | 1.01% |
| Lesotho MAPE | 6.18% |
| Uzbekistan MAPE | 0.86% |

Lesotho is the least accurate (small cohort → higher relative volatility), which also makes it
the most sensitive country in scenario/sensitivity analysis.

---

## 6. Uncertainty & analytical engines

### 6.1 Monte Carlo (500 simulations) — `run_monte_carlo()`

Two independent noise sources per simulation:
1. **Demographic perturbation** (`perturb()`): births & `Pop_Age_0` scaled by
   `N(1, 0.05·h)`; IMR & U5 mortality by `N(1, 0.10·h)`, where the **horizon scale**
   `h = 1 + 0.15·(year − first_year)` widens uncertainty further into the future.
   Perturbed demographics are **clipped ≥ 0** before the model sees them.
2. **Residual noise:** residuals from a long walk-forward backtest (2010+) are standardised
   per country by **median absolute deviation (MAD)**, pooled, fitted to a **Student-t**
   distribution (heavy tails), then sampled and re-scaled by each country's MAD.

Predictions are clipped to `[0, latest_actual × 2]`. Output percentiles: **P5, P25, P50,
P75, P95**. Seeded (`RandomState(42)`) for reproducibility.

### 6.2 Scenario engine (model-driven) — `run_scenarios()`

Four scenarios (`baseline`, `optimistic`, `pessimistic`, `pandemic`) apply fixed multipliers to
the **future demographic inputs** (IMR, U5 rate, births, `Pop_Age_0`, migration) and re-run the
recursive forecast. **Known limitation:** because it perturbs demographics through the recursive
model, magnitudes are erratic across countries (e.g. Lesotho optimistic ≈ +60%) and can show
first-year sign flips. It is retained only behind the dashboard's "Model-driven (advanced)"
toggle; the **default scenario tool is the transparent builder** (§8.2).

### 6.3 Sensitivity — `run_sensitivity()`

- **Tornado (OAT):** each of 7 demographic drivers is perturbed **±5%** one-at-a-time; the
  average % change in the forecast (over 2025–2030) gives the positive/negative bars.
- **Feature importance:** absolute impact bucketed HIGH (>0.5), MEDIUM (>0.2), LOW.
- **Elasticity curves:** each top-3 driver swept **−20%…+20%** in 21 steps; the 2030 %-change
  curve is stored.

---

## 7. Cost model

Constants live only in `COST_CONFIG` ([generate_data.py](../backend/generate_data.py)) and flow
into `data.json.costConfig` — nothing is hard-coded downstream.

```
pricePerDose   = US$0.318         # Gavi/UNICEF 10-dose measles presentation
bakedInWastage = 0.25             # target already ÷ 0.75

children_covered = MCV1_TARGET × 0.75              # wastage-invariant base
doses(w)         = children_covered ÷ (1 − w)      # w = UI wastage slider, 0–50%
cost(w)  (US$)   = doses × 1000 × 0.318
coverage%        = children_covered ÷ Pop_Age_0 × 100
```

At the default `w = 0.25`, `doses = MCV1_TARGET` exactly, so the dashboard reproduces the
published targets. The wastage slider is **pure post-prediction arithmetic** — it never re-runs
the model. Frontend implementation: [`transform.ts`](../frontend/src/lib/transform.ts).

---

## 8. Frontend architecture

**Stack:** Vite + React + TypeScript + Tailwind + Recharts. Loads the static `data.json`; no
server. Four pages: Overview, Forecast & Demographics, Uncertainty (Monte Carlo),
Scenarios & Sensitivity. Global controls: country, lens (**US$ / Doses**), wastage slider,
CSV export.

### 8.1 Data contract (`data.json`, v2)

`meta` · `costConfig` · `countries` · `historical` · `forecastBaseline` · `popAge0` ·
`demographics` · `demographicTrends` · `futureDemographics` · `mcData` · `scenarios` ·
`scenarioMeta` · `tornadoData` · `featureImportance` · `elasticityData` · `backtest` ·
`costProjections`.

### 8.2 Transparent scenario builder ([`scenario.ts`](../frontend/src/lib/scenario.ts))

Replaces the model-driven scenarios for planning. Two monotonic levers applied to the baseline:

```
adjusted_target[y] = baseline_target[y]
                     × (1 + cohortPct/100)                 # cohort/demand shock
                     × (cov0[y] + coveragePP) / cov0[y]     # coverage shock (pp)
```

Presets (Optimistic +2%/+5pp, Pessimistic −3%/−5pp, Pandemic −3%/−15pp) just set the sliders.
Result is smooth and consistent across countries (Optimistic +7–8.5%, Pandemic −17–22%), with
`(0,0)` reproducing the baseline exactly.

---

## 9. Assumptions & limitations

**Assumptions**
1. `MCV1_TARGET` is a dose count in thousands including a fixed 25% wastage (÷0.75).
2. UN medium-variant demographics are the central case for 2025–2030.
3. Unit cost US$0.318/dose (Gavi/UNICEF 10-dose measles) applies uniformly to all three countries.
4. Historical demographic→MCV1 relationships persist over the forecast horizon.
5. Monte Carlo demographic uncertainty grows 15%/year; residuals follow a Student-t.

**Limitations**
1. Small-cohort countries (Lesotho) have higher relative error and amplified sensitivity.
2. The recursive model cannot represent behavioural coverage collapse from demographics alone — hence the coverage-shock lever in the builder.
3. Forecast "effective coverage" can slightly exceed 100% (e.g. Uzbekistan ≈102%) when predicted doses outpace the projected birth cohort; shown honestly, not clamped.
4. Only three countries and one vaccine; extending requires new CSV rows and, for new country dummies, a feature-set update.
5. Cost excludes freight, cold-chain, and delivery — it is a **vaccine-procurement** figure only.

---

## 10. Reproduce

```bash
cd backend
python generate_data.py        # -> ../frontend/public/data.json
cd ../frontend
npm install && npm run dev      # http://localhost:5173
```
