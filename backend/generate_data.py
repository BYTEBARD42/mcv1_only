"""
MCV1 forecasting data pipeline. Trains the model, runs the analytical engines,
and writes frontend/public/data.json.

MCV1_TARGET is a dose / procurement volume (thousands), not a coverage percentage;
it includes a 25% wastage allowance (target = children_covered / 0.75). popAge0 is
exposed per year so coverage can be derived. Cost = doses * 1000 * pricePerDose.
"""
import numpy as np
import pandas as pd
import json
import os
from scipy.stats import median_abs_deviation, t as t_dist
import warnings
warnings.filterwarnings("ignore")

from mcv1_forecast.core import (
    train_model, recursive_forecast, engineer_features,
    COUNTRIES, TARGET, mape,
)
from sklearn.metrics import mean_absolute_error

# ── business / cost constants (the ONLY hard constants; both sourced) ──────────
COST_CONFIG = {
    "pricePerDose": 0.318,          # US$, Gavi/UNICEF 10-dose measles presentation
    "presentation": "10-dose",
    "currency": "USD",
    "bakedInWastage": 0.25,         # target = children_covered / (1 - 0.25) = /0.75
    "defaultWastage": 0.25,         # UI slider default; range 0.00 - 0.50
    "source": "Gavi/UNICEF 10-dose measles vaccine price (US$0.318/dose)",
    "note": "Target already includes 25% wastage. children_covered = target*0.75; "
            "doses(w) = children_covered/(1-w); cost = doses*1000*pricePerDose.",
}
BAKED = 1.0 - COST_CONFIG["bakedInWastage"]     # 0.75
FORECAST_YEARS = list(range(2025, 2031))


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    os.chdir(here)

    print("Loading data and training baseline model...")
    df_raw = pd.read_csv("vaccine_data.csv")
    future_demo_df = pd.read_csv("future_demographics.csv")
    model, df_engineered, feature_cols, dummy_cols = train_model(df_raw)

    # ── baseline forecast 2025-2030 ───────────────────────────────────────────
    print("Running baseline forecast (2025-2030)...")
    forecast_raw = recursive_forecast(
        df_engineered, model, feature_cols, dummy_cols, 2025, TARGET, future_demo_df
    )
    forecast_baseline = {}
    for c in COUNTRIES:
        f = forecast_raw[forecast_raw["Country"] == c].sort_values("Year")
        forecast_baseline[c] = f["Predicted"].round(3).tolist()

    # ── backtest 2020-2024 (+ per-country MAPE) ───────────────────────────────
    print("Running backtest (2020-2024)...")
    backtest_raw = recursive_forecast(
        df_engineered, model, feature_cols, dummy_cols, 2020, TARGET
    )
    backtest_data, backtest_mape = {}, {}
    for c in COUNTRIES:
        cb = backtest_raw[backtest_raw["Country"] == c].dropna(subset=["Actual", "Predicted"])
        backtest_data[c] = cb[["Year", "Actual", "Predicted"]].rename(
            columns={"Year": "year", "Actual": "actual", "Predicted": "predicted"}
        ).to_dict("records")
        if len(cb):
            backtest_mape[c] = round(mape(cb["Actual"].values, cb["Predicted"].values), 2)
    all_bt = backtest_raw.dropna(subset=["Actual", "Predicted"])
    overall_mape = round(mape(all_bt["Actual"].values, all_bt["Predicted"].values), 2)
    overall_mae = round(mean_absolute_error(all_bt["Actual"], all_bt["Predicted"]), 2)

    # ── Monte Carlo ───────────────────────────────────────────────────────────
    print("Running Monte Carlo simulations (500)...")
    mc_data = run_monte_carlo(df_raw, df_engineered, model, feature_cols,
                              dummy_cols, future_demo_df)

    # ── Scenarios ─────────────────────────────────────────────────────────────
    print("Running scenarios...")
    scenarios_data, scenario_meta = run_scenarios(
        df_engineered, model, feature_cols, dummy_cols, future_demo_df
    )

    # ── Sensitivity: tornado + feature importance + elasticity ────────────────
    print("Running sensitivity (tornado + elasticity)...")
    tornado_data, feature_importance, elasticity_data = run_sensitivity(
        df_engineered, model, feature_cols, dummy_cols, future_demo_df
    )

    # ── history, demographics, popAge0 (for real coverage %) ──────────────────
    print("Assembling history / demographics / popAge0 / future demographics...")
    historical, demographic_trends, demographics, pop_age0 = {}, {}, {}, {}
    future_demographics = {}
    FUT_COLS = {
        "Pop_Age_0(In Thousands)": "popAge0",
        "Total Population, as of 1 January (thousands)": "population",
        "Births (thousands)": "births",
        "Crude Birth Rate (births per 1,000 population)": "crudeBirthRate",
        "Infant Mortality Rate (infant deaths per 1,000 live births)": "infantMortalityRate",
        "Under-Five Mortality (deaths under age 5 per 1,000 live births)": "under5Mortality",
        "Net Number of Migrants (thousands)": "netMigration",
        "Net Migration Rate (per 1,000 population)": "netMigrationRate",
    }
    for c in COUNTRIES:
        hist = df_raw[(df_raw["Country"] == c) & (df_raw["Year"].between(2000, 2024))].sort_values("Year")
        historical[c] = hist[["Year", TARGET]].rename(
            columns={TARGET: "value", "Year": "year"}
        ).to_dict("records")

        full = df_raw[df_raw["Country"] == c].sort_values("Year")
        demographic_trends[c] = [{
            "year": int(r["Year"]),
            "pop": int(r["Total Population, as of 1 July (thousands)"] * 1000),
            "births": int(r["Births (thousands)"] * 1000),
            "br": round(r["Crude Birth Rate (births per 1,000 population)"], 2),
            "imr": round(r["Infant Mortality Rate (infant deaths per 1,000 live births)"], 2),
            "u5": round(r["Under-Five Mortality (deaths under age 5 per 1,000 live births)"], 2),
            "mig": int(r["Net Number of Migrants (thousands)"] * 1000),
        } for _, r in full.iterrows()]

        # popAge0 per year: historical actuals + future projections (thousands)
        pa = {int(r["Year"]): round(r["Pop_Age_0(In Thousands)"], 3)
              for _, r in full.iterrows()}
        fut = future_demo_df[future_demo_df["Country"] == c]
        for _, r in fut.iterrows():
            pa[int(r["Year"])] = round(r["Pop_Age_0(In Thousands)"], 3)
        pop_age0[c] = [{"year": y, "popAge0": pa[y]} for y in sorted(pa)]

        # full future demographics per forecast year (for the merged CSV export)
        fut_sorted = fut.sort_values("Year")
        future_demographics[c] = [
            {"year": int(r["Year"]),
             **{alias: round(float(r[col]), 3) for col, alias in FUT_COLS.items()}}
            for _, r in fut_sorted.iterrows()
        ]

        d25 = future_demo_df[(future_demo_df["Country"] == c) & (future_demo_df["Year"] == 2025)].iloc[0]
        demographics[c] = {
            "totalPopulation": int(d25["Total Population, as of 1 January (thousands)"] * 1000),
            "births2025": int(d25["Births (thousands)"] * 1000),
            "popAge0_2025": round(d25["Pop_Age_0(In Thousands)"], 1),
            "crudeBirthRate": round(d25["Crude Birth Rate (births per 1,000 population)"], 2),
            "infantMortalityRate": round(d25["Infant Mortality Rate (infant deaths per 1,000 live births)"], 2),
            "under5Mortality": round(d25["Under-Five Mortality (deaths under age 5 per 1,000 live births)"], 2),
            "netMigration": int(d25["Net Number of Migrants (thousands)"] * 1000),
        }

    # ── costProjections at default wastage (convenience for tables) ───────────
    # base childrenCovered = target * 0.75 ; doses@25% = target ; cost = target*1000*price
    cost_projections = {}
    for c in COUNTRIES:
        rows = []
        for i, y in enumerate(FORECAST_YEARS):
            target = forecast_baseline[c][i]
            children = target * BAKED
            doses = children / (1 - COST_CONFIG["defaultWastage"])
            rows.append({
                "year": y,
                "children": round(children * 1000),
                "doses": round(doses * 1000),
                "costUSD": round(doses * 1000 * COST_CONFIG["pricePerDose"]),
            })
        cost_projections[c] = rows

    data = {
        "meta": {
            "horizon": [FORECAST_YEARS[0], FORECAST_YEARS[-1]],
            "modelMAPE": overall_mape,
            "modelMAE": overall_mae,
            "backtestMAPE": backtest_mape,
            "targetSemantics": "MCV1_TARGET = annual MCV1 doses (thousands), incl. 25% wastage",
        },
        "costConfig": COST_CONFIG,
        "countries": COUNTRIES,
        "historical": historical,
        "forecastBaseline": forecast_baseline,
        "popAge0": pop_age0,
        "demographics": demographics,
        "demographicTrends": demographic_trends,
        "futureDemographics": future_demographics,
        "mcData": mc_data,
        "scenarios": scenarios_data,
        "scenarioMeta": scenario_meta,
        "tornadoData": tornado_data,
        "featureImportance": feature_importance,
        "elasticityData": elasticity_data,
        "backtest": backtest_data,
        "costProjections": cost_projections,
    }

    project_dir = os.path.dirname(here)
    out_dir = os.path.join(project_dir, "frontend", "public")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "data.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"OK -> {out_path}")
    print(f"   overall MAPE={overall_mape}%  MAE={overall_mae}  per-country MAPE={backtest_mape}")


# ── Monte Carlo ───────────────────────────────────────────────────────────────
def run_monte_carlo(df_raw, df_engineered, model, feature_cols, dummy_cols,
                    future_demo_df, n_sim=500, seed=42):
    rng = np.random.RandomState(seed)

    # residual pool from a long walk-forward backtest (2010+)
    bt = recursive_forecast(df_engineered, model, feature_cols, dummy_cols, 2010, TARGET)
    bt = bt.dropna(subset=["Actual", "Predicted"])
    bt["Residual"] = bt["Actual"] - bt["Predicted"]
    country_scale, standardized = {}, []
    for c in COUNTRIES:
        res = bt[bt["Country"] == c]["Residual"].values
        if len(res) > 1:
            madv = median_abs_deviation(res, scale="normal")
            if madv == 0:
                madv = max(np.max(np.abs(res)), 1e-6)
            country_scale[c] = madv
            standardized.append((res - np.median(res)) / madv)
        else:
            country_scale[c] = 5.0
    pool = np.concatenate(standardized) if standardized else np.array([0.0])
    df_t, loc_t, scale_t = t_dist.fit(pool)

    # latest-year actual per country (used for the MC upper clip)
    last_actual = {c: df_raw[df_raw["Country"] == c].sort_values("Year")[TARGET].iloc[-1]
                   for c in COUNTRIES}

    def perturb(demo_df):
        p = demo_df.copy()
        base_year = int(p["Year"].min())
        for idx, r in p.iterrows():
            hs = 1.0 + 0.15 * (r["Year"] - base_year)
            bm = rng.normal(1.0, 0.05 * hs)
            im = rng.normal(1.0, 0.10 * hs)
            p.at[idx, "Births (thousands)"] *= bm
            p.at[idx, "Pop_Age_0(In Thousands)"] *= bm
            p.at[idx, "Infant Mortality Rate (infant deaths per 1,000 live births)"] *= im
            p.at[idx, "Under-Five Mortality (deaths under age 5 per 1,000 live births)"] *= im
        # keep demographics non-negative before the model sees them
        for col in ["Births (thousands)", "Pop_Age_0(In Thousands)",
                    "Infant Mortality Rate (infant deaths per 1,000 live births)",
                    "Under-Five Mortality (deaths under age 5 per 1,000 live births)"]:
            p[col] = p[col].clip(lower=0)
        return p

    all_runs = []
    for sim in range(n_sim):
        pred = recursive_forecast(df_engineered, model, feature_cols, dummy_cols,
                                  2025, TARGET, perturb(future_demo_df))
        for c in COUNTRIES:
            m = pred["Country"] == c
            n = int(m.sum())
            if n:
                noise = t_dist.rvs(df_t, loc=loc_t, scale=scale_t, size=n,
                                   random_state=rng) * country_scale[c]
                pred.loc[m, "Predicted"] = (pred.loc[m, "Predicted"] + noise).clip(
                    lower=0, upper=last_actual[c] * 2.0)
        pred["sim"] = sim
        all_runs.append(pred)
    sims = pd.concat(all_runs, ignore_index=True)

    mc = {}
    for c in COUNTRIES:
        cd = sims[sims["Country"] == c]
        rows = []
        for y in sorted(cd["Year"].unique()):
            v = cd[cd["Year"] == y]["Predicted"].values
            rows.append({
                "year": int(y),
                "p5": round(float(np.percentile(v, 5)), 1),
                "p25": round(float(np.percentile(v, 25)), 1),
                "p50": round(float(np.percentile(v, 50)), 1),
                "p75": round(float(np.percentile(v, 75)), 1),
                "p95": round(float(np.percentile(v, 95)), 1),
            })
        mc[c] = rows
    return mc


# ── Scenarios ─────────────────────────────────────────────────────────────────
SCENARIO_DEFS = {
    "baseline":    {"label": "BASELINE", "color": "#3498db",
                    "description": "UN medium-variant projections (no adjustment)",
                    "adjustments": {}},
    "optimistic":  {"label": "OPTIMISTIC", "color": "#2ecc71",
                    "description": "Strong health system, declining mortality, stable births",
                    "adjustments": {
                        "Infant Mortality Rate (infant deaths per 1,000 live births)": 0.85,
                        "Under-Five Mortality (deaths under age 5 per 1,000 live births)": 0.85,
                        "Births (thousands)": 1.02, "Pop_Age_0(In Thousands)": 1.02}},
    "pessimistic": {"label": "PESSIMISTIC", "color": "#e74c3c",
                    "description": "Health system stress, rising mortality, declining coverage",
                    "adjustments": {
                        "Infant Mortality Rate (infant deaths per 1,000 live births)": 1.15,
                        "Under-Five Mortality (deaths under age 5 per 1,000 live births)": 1.15,
                        "Births (thousands)": 0.95, "Pop_Age_0(In Thousands)": 0.95}},
    "pandemic":    {"label": "PANDEMIC SHOCK", "color": "#9b59b6",
                    "description": "COVID-like disruption: coverage drops, migration halts",
                    "adjustments": {
                        "Net Number of Migrants (thousands)": 0.3,
                        "Net Migration Rate (per 1,000 population)": 0.3,
                        "Births (thousands)": 0.97, "Pop_Age_0(In Thousands)": 0.97}},
}


def run_scenarios(df_engineered, model, feature_cols, dummy_cols, future_demo_df):
    scenarios_data = {c: {} for c in COUNTRIES}
    meta = {}
    for name, s in SCENARIO_DEFS.items():
        meta[name] = {"label": s["label"], "color": s["color"], "description": s["description"]}
        adj = future_demo_df.copy()
        for feat, mult in s["adjustments"].items():
            if feat in adj.columns:
                adj[feat] *= mult
                if "Migration" not in feat and "Migrants" not in feat:
                    adj[feat] = adj[feat].clip(lower=0)
        pred = recursive_forecast(df_engineered, model, feature_cols, dummy_cols,
                                  2025, TARGET, adj)
        for c in COUNTRIES:
            scenarios_data[c][name] = (
                pred[pred["Country"] == c].sort_values("Year")["Predicted"].round(3).tolist())
    return scenarios_data, meta


# ── Sensitivity (tornado + importance + elasticity) ───────────────────────────
SENS_FEATURES = [
    "Births (thousands)",
    "Crude Birth Rate (births per 1,000 population)",
    "Infant Mortality Rate (infant deaths per 1,000 live births)",
    "Under-Five Mortality (deaths under age 5 per 1,000 live births)",
    "Net Number of Migrants (thousands)",
    "Net Migration Rate (per 1,000 population)",
    "Pop_Age_0(In Thousands)",
]
NAME_MAP = {
    "Births (thousands)": "Births",
    "Crude Birth Rate (births per 1,000 population)": "Birth Rate",
    "Infant Mortality Rate (infant deaths per 1,000 live births)": "IMR",
    "Under-Five Mortality (deaths under age 5 per 1,000 live births)": "U5 Mortality",
    "Net Number of Migrants (thousands)": "Net Migration",
    "Net Migration Rate (per 1,000 population)": "Migration Rate",
    "Pop_Age_0(In Thousands)": "Pop Age 0",
}
REVERSE_MAP = {v: k for k, v in NAME_MAP.items()}


def _baseline_series(df_engineered, model, feature_cols, dummy_cols, demo, c):
    p = recursive_forecast(df_engineered, model, feature_cols, dummy_cols, 2025, TARGET, demo)
    return p[p["Country"] == c].set_index("Year")["Predicted"]


def run_sensitivity(df_engineered, model, feature_cols, dummy_cols, future_demo_df, pct=5):
    tornado_data, feature_importance, elasticity_data = {}, {}, {}
    for c in COUNTRIES:
        base = _baseline_series(df_engineered, model, feature_cols, dummy_cols, future_demo_df, c)
        rows = []
        for feat in SENS_FEATURES:
            if feat not in future_demo_df.columns:
                continue
            mask = future_demo_df["Country"] == c
            hi = future_demo_df.copy(); hi.loc[mask, feat] *= (1 + pct / 100)
            lo = future_demo_df.copy(); lo.loc[mask, feat] *= (1 - pct / 100)
            sh = _baseline_series(df_engineered, model, feature_cols, dummy_cols, hi, c)
            sl = _baseline_series(df_engineered, model, feature_cols, dummy_cols, lo, c)
            hi_imp = np.mean([(sh[y] - base[y]) / base[y] * 100 for y in base.index if base[y]])
            lo_imp = np.mean([(sl[y] - base[y]) / base[y] * 100 for y in base.index if base[y]])
            rows.append({"feature": NAME_MAP[feat], "pos": round(hi_imp, 2),
                         "neg": round(lo_imp, 2), "abs": abs(hi_imp)})
        rows.sort(key=lambda r: r["abs"], reverse=True)
        tornado_data[c] = [{"feature": r["feature"], "pos": r["pos"], "neg": r["neg"]} for r in rows]
        feature_importance[c] = [{
            "name": r["feature"],
            "impact": "HIGH" if r["abs"] > 0.5 else ("MEDIUM" if r["abs"] > 0.2 else "LOW"),
            "score": round(r["abs"], 2)} for r in rows]

        # elasticity curves (2030) for top-3 drivers
        elasticity_data[c] = {}
        for fi in feature_importance[c][:3]:
            full = REVERSE_MAP.get(fi["name"], fi["name"])
            pts = []
            for p in np.linspace(-20, 20, 21):
                adj = future_demo_df.copy()
                adj.loc[future_demo_df["Country"] == c, full] *= (1 + p / 100)
                s = _baseline_series(df_engineered, model, feature_cols, dummy_cols, adj, c)
                if 2030 in s.index and base[2030]:
                    pts.append({"x": round(float(p), 1),
                                "y": round(float((s[2030] - base[2030]) / base[2030] * 100), 2)})
            elasticity_data[c][fi["name"]] = pts
    return tornado_data, feature_importance, elasticity_data


if __name__ == "__main__":
    main()
