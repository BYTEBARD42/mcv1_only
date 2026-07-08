"""
Generate real scenario forecasts and update data.json.
Uses the same ScenarioEngine approach as scenarios.ipynb
but writes results into the frontend data pipeline.
"""
import numpy as np
import pandas as pd
import json
import os
import sys
import warnings
warnings.filterwarnings("ignore")

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from mcv1_forecast.core import train_model, recursive_forecast, COUNTRIES, TARGET

# --- Load data and train model ---
print("Loading data and training model...")
df_raw = pd.read_csv("backend/vaccine_data.csv")
future_demo_df = pd.read_csv("backend/future_demographics.csv")
model, df_engineered, feature_cols, dummy_cols = train_model(df_raw)

# --- Define scenarios (exact same as scenarios.ipynb) ---
SCENARIOS = {
    'optimistic': {
        'description': 'Strong health system, declining mortality, stable births',
        'adjustments': {
            'Infant Mortality Rate (infant deaths per 1,000 live births)': 0.85,
            'Under-Five Deaths, under age 5 (thousands)': 0.85,
            'Births (thousands)': 1.02,
            'Pop_Age_0(In Thousands)': 1.02,
        }
    },
    'pessimistic': {
        'description': 'Health system stress, rising mortality, declining coverage',
        'adjustments': {
            'Infant Mortality Rate (infant deaths per 1,000 live births)': 1.15,
            'Under-Five Deaths, under age 5 (thousands)': 1.15,
            'Births (thousands)': 0.95,
            'Pop_Age_0(In Thousands)': 0.95,
        }
    },
    'pandemic': {
        'description': 'COVID-like disruption: coverage drops, migration halts',
        'adjustments': {
            'Net Number of Migrants (thousands)': 0.3,
            'Net Migration Rate (per 1,000 population)': 0.3,
            'Births (thousands)': 0.97,
            'Pop_Age_0(In Thousands)': 0.97,
        }
    },
}

# --- Run scenario forecasts ---
print("Running scenario forecasts...")
scenario_data = {}

for c in COUNTRIES:
    scenario_data[c] = {}

# Baseline is already computed, but let's also store it
print("  Running baseline...")
baseline_pred = recursive_forecast(df_engineered, model, feature_cols, dummy_cols, 2025, TARGET, future_demo_df)
for c in COUNTRIES:
    c_pred = baseline_pred[baseline_pred['Country'] == c].sort_values('Year')
    scenario_data[c]['baseline'] = c_pred['Predicted'].round(3).tolist()

for scenario_name, scenario_def in SCENARIOS.items():
    print(f"  Running {scenario_name}...")
    adjusted_demo = future_demo_df.copy()
    
    for feature, multiplier in scenario_def['adjustments'].items():
        if feature in adjusted_demo.columns:
            adjusted_demo[feature] *= multiplier
            # Prevent negative values for non-migration columns
            if 'Migration' not in feature and 'Migrants' not in feature:
                adjusted_demo[feature] = adjusted_demo[feature].clip(lower=0)
    
    pred = recursive_forecast(df_engineered, model, feature_cols, dummy_cols, 2025, TARGET, adjusted_demo)
    
    for c in COUNTRIES:
        c_pred = pred[pred['Country'] == c].sort_values('Year')
        scenario_data[c][scenario_name] = c_pred['Predicted'].round(3).tolist()

# --- Print results for verification ---
print("\nScenario Results:")
for c in COUNTRIES:
    print(f"\n{c}:")
    for s_name, vals in scenario_data[c].items():
        print(f"  {s_name}: {vals}")

# --- Update data.json ---
print("\nUpdating data.json...")
data_path = os.path.join('frontend', 'public', 'data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['scenarios'] = scenario_data

# Also store scenario metadata for the frontend
data['scenarioMeta'] = {
    'baseline': {
        'label': 'BASELINE',
        'description': 'UN medium-variant projections, no adjustments',
        'color': '#3498db'
    },
    'optimistic': {
        'label': 'OPTIMISTIC', 
        'description': 'IMR ×0.85, U5 Deaths ×0.85, Births ×1.02',
        'color': '#2ecc71'
    },
    'pessimistic': {
        'label': 'PESSIMISTIC',
        'description': 'IMR ×1.15, U5 Deaths ×1.15, Births ×0.95',
        'color': '#e74c3c'
    },
    'pandemic': {
        'label': 'PANDEMIC SHOCK',
        'description': 'Migration ×0.3, Births ×0.97 (COVID-like disruption)',
        'color': '#9b59b6'
    }
}

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Successfully updated {data_path} with real scenario data!")
