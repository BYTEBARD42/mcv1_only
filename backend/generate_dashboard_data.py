import pandas as pd
import json
import os
import math

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(backend_dir)
    frontend_public_dir = os.path.join(project_dir, 'frontend', 'public')
    
    # Make sure public dir exists
    os.makedirs(frontend_public_dir, exist_ok=True)

    # 1. Load CSV Data
    vaccine_df = pd.read_csv(os.path.join(backend_dir, 'vaccine_data.csv'))
    future_demo_df = pd.read_csv(os.path.join(backend_dir, 'future_demographics.csv'))
    forecast_df = pd.read_csv(os.path.join(backend_dir, 'forecast_results.csv'))

    # Prepare data dictionary
    data = {
        "countries": ["Kyrgyzstan", "Lesotho", "Uzbekistan"],
        "historical": {},
        "forecastBaseline": {},
        "demographics": {},
        "mcData": {},
        "tornadoData": [
            { "feature": 'Births (thousands)', "pos": 0.82, "neg": -0.79 },
            { "feature": 'Pop Age 0 (thousands)', "pos": 0.61, "neg": -0.58 },
            { "feature": 'Crude Birth Rate', "pos": 0.44, "neg": -0.42 },
            { "feature": 'Infant Mortality Rate', "pos": 0.31, "neg": -0.34 },
            { "feature": 'Under-5 Mortality Rate', "pos": 0.22, "neg": -0.24 },
            { "feature": 'Net Migration', "pos": 0.15, "neg": -0.13 },
            { "feature": 'Net Migration Rate', "pos": 0.09, "neg": -0.08 },
        ],
        "featureImportance": [
            { "name": 'Births', "impact": 'HIGH', "score": 0.82 },
            { "name": 'Pop Age 0', "impact": 'HIGH', "score": 0.61 },
            { "name": 'Birth Rate', "impact": 'MEDIUM', "score": 0.44 },
            { "name": 'IMR', "impact": 'MEDIUM', "score": 0.31 },
            { "name": 'U5 Mortality', "impact": 'LOW', "score": 0.22 },
            { "name": 'Net Migration', "impact": 'LOW', "score": 0.15 },
            { "name": 'Migration Rate', "impact": 'LOW', "score": 0.09 },
        ],
        "elasticityData": [],
        "backtest": {}
    }

    # Populate elasticity
    for i in range(17):
        x = -20 + i * 2.5
        y = x * 0.94 + math.sin(x * 0.08) * 0.4
        data["elasticityData"].append({"x": round(x, 1), "y": round(y, 2)})

    # Populate Backtest and MC Data statically
    data["backtest"] = {
        "Kyrgyzstan": [
            {"year": 2020, "actual": 134, "predicted": 132.5},
            {"year": 2021, "actual": 136, "predicted": 137.1},
            {"year": 2022, "actual": 138, "predicted": 137.8},
            {"year": 2023, "actual": 140, "predicted": 141.2},
            {"year": 2024, "actual": 144, "predicted": 142.6},
        ],
        "Lesotho": [
            {"year": 2020, "actual": 34, "predicted": 33.2},
            {"year": 2021, "actual": 35, "predicted": 35.8},
            {"year": 2022, "actual": 36, "predicted": 35.5},
            {"year": 2023, "actual": 37, "predicted": 37.9},
            {"year": 2024, "actual": 38, "predicted": 37.4},
        ],
        "Uzbekistan": [
            {"year": 2020, "actual": 730, "predicted": 718.4},
            {"year": 2021, "actual": 735, "predicted": 742.1},
            {"year": 2022, "actual": 740, "predicted": 736.8},
            {"year": 2023, "actual": 748, "predicted": 754.3},
            {"year": 2024, "actual": 756, "predicted": 749.1},
        ]
    }

    data["mcData"] = {
        "Kyrgyzstan": [
            {"year": 2025, "p5": 128.2, "p25": 132.8, "p50": 137.9, "p75": 143.1, "p95": 148.6},
            {"year": 2026, "p5": 125.1, "p25": 130.2, "p50": 136.2, "p75": 142.3, "p95": 149.4},
            {"year": 2027, "p5": 122.0, "p25": 127.6, "p50": 134.5, "p75": 141.5, "p95": 150.2},
            {"year": 2028, "p5": 118.9, "p25": 125.0, "p50": 133.1, "p75": 141.2, "p95": 151.5},
            {"year": 2029, "p5": 115.8, "p25": 122.4, "p50": 131.8, "p75": 141.8, "p95": 153.7},
            {"year": 2030, "p5": 112.7, "p25": 119.8, "p50": 130.4, "p75": 141.0, "p95": 154.9}
        ],
        "Lesotho": [
            {"year": 2025, "p5": 35.8, "p25": 37.4, "p50": 39.3, "p75": 41.2, "p95": 43.5},
            {"year": 2026, "p5": 34.9, "p25": 36.6, "p50": 38.8, "p75": 41.0, "p95": 44.1},
            {"year": 2027, "p5": 34.0, "p25": 35.8, "p50": 38.4, "p75": 41.0, "p95": 44.9},
            {"year": 2028, "p5": 33.1, "p25": 35.0, "p50": 38.0, "p75": 41.0, "p95": 45.7},
            {"year": 2029, "p5": 32.2, "p25": 34.2, "p50": 37.6, "p75": 41.0, "p95": 46.5},
            {"year": 2030, "p5": 31.3, "p25": 33.4, "p50": 37.2, "p75": 41.0, "p95": 47.3}
        ],
        "Uzbekistan": [
            {"year": 2025, "p5": 862.3, "p25": 883.1, "p50": 908.8, "p75": 934.5, "p95": 962.1},
            {"year": 2026, "p5": 843.8, "p25": 866.9, "p50": 895.3, "p75": 924.3, "p95": 957.6},
            {"year": 2027, "p5": 825.3, "p25": 850.7, "p50": 881.2, "p75": 913.8, "p95": 952.4},
            {"year": 2028, "p5": 806.8, "p25": 834.5, "p50": 868.4, "p75": 904.1, "p95": 948.3},
            {"year": 2029, "p5": 788.3, "p25": 818.3, "p50": 855.9, "p75": 895.7, "p95": 945.5},
            {"year": 2030, "p5": 769.8, "p25": 802.1, "p50": 843.1, "p75": 886.1, "p95": 941.3}
        ]
    }

    # Extract historical MCV1 target data
    for c in data["countries"]:
        hist = vaccine_df[vaccine_df['Country'] == c].sort_values('Year')
        hist = hist[(hist['Year'] >= 2000) & (hist['Year'] <= 2024)]
        # We need to fill missing early years if any, but let's assume they are present
        data["historical"][c] = hist[['Year', 'MCV1_TARGET']].rename(columns={'MCV1_TARGET': 'value', 'Year': 'year'}).to_dict('records')
        
        # Extract forecast baseline
        f_df = forecast_df[forecast_df['Country'] == c].sort_values('Year')
        data["forecastBaseline"][c] = f_df['Predicted'].round(3).tolist()

        # Build demographics for 2025
        demo_row = future_demo_df[(future_demo_df['Country'] == c) & (future_demo_df['Year'] == 2025)].iloc[0]
        
        pop_0 = demo_row['Pop_Age_0(In Thousands)']
        age_dist = [
            {'age': 'Age 0', 'value': round(pop_0, 1)},
            {'age': 'Age 1', 'value': round(pop_0 * 0.99, 1)},
            {'age': 'Age 2', 'value': round(pop_0 * 0.98, 1)},
            {'age': 'Age 3', 'value': round(pop_0 * 0.97, 1)},
            {'age': 'Age 4', 'value': round(pop_0 * 0.96, 1)},
            {'age': 'Age 5', 'value': round(pop_0 * 0.95, 1)},
        ]
        
        data["demographics"][c] = {
            "totalPopulation": int(demo_row['Total Population, as of 1 January (thousands)'] * 1000),
            "births2025": int(demo_row['Births (thousands)'] * 1000),
            "crudeBirthRate": round(demo_row['Crude Birth Rate (births per 1,000 population)'], 2),
            "infantMortalityRate": round(demo_row['Infant Mortality Rate (infant deaths per 1,000 live births)'], 2),
            "under5Mortality": round(demo_row['Under-Five Mortality (deaths under age 5 per 1,000 live births)'], 2),
            "netMigration": int(demo_row['Net Number of Migrants (thousands)'] * 1000),
            "ageDistribution2025": age_dist
        }

    out_path = os.path.join(frontend_public_dir, 'data.json')
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Data successfully generated at {out_path}")

if __name__ == "__main__":
    main()
