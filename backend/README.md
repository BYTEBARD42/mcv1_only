# Gavi MCV1 Coverage Forecasting

## Overview
This project forecasts Measles-Containing Vaccine dose 1 (MCV1) coverage for multiple countries. It uses demographic data and statistical modeling to project future vaccination rates out to 2030. The project includes an interactive web dashboard to visualize these forecasts, evaluate different scenarios, and analyze uncertainty.

## System Components
The system consists of a Python-based data pipeline and a static web frontend.

### 1. Forecasting and Simulation Pipeline
- **Core Model**: A robust regression model (Huber Regressor) trained on historical demographic data, population growth, and past vaccination rates.
- **Scenario Engine**: Tests predefined "what-if" situations (e.g., Pandemic Shock, Optimistic) by modifying future birth and mortality projections to see their impact on coverage.
- **Monte Carlo Engine**: Runs simulations incorporating historical error distributions to generate 50% and 90% confidence intervals around the baseline forecast.
- **Sensitivity Analyzer**: Measures how 10% shifts in key demographic variables (like infant mortality or birth rates) impact the final forecast.

### 2. Interactive Dashboard
- Built with standard HTML, CSS, and Chart.js.
- Displays key metrics, historical actuals, forecast fan charts, and a tornado chart for sensitivity analysis.

## How to Run

### Step 1: Generate Forecast Data
Run the main script to process the data, train the model, and run all simulations.
```bash
python generate_dashboard_data.py
```
This script reads `vaccine_data.csv` and `future_demographics.csv` and outputs the compiled results to `dashboard/data.json`.

### Step 2: View the Dashboard
Navigate to the `dashboard` folder and start a local web server:
```bash
cd dashboard
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser to view the interactive dashboard.

## Guide for Teams

**For Business & Policy Teams:**
The dashboard is the primary tool for strategic planning. You can use it to understand potential future trajectories of MCV1 coverage, assess the risk of demographic shocks, and review confidence intervals to better allocate resources and target interventions.

**For Technical Teams:**
The backend is modular by design. You can add new countries by updating the dataset, introduce new predictive features in `mcv1_forecast/core.py`, or tweak scenario multipliers directly within `generate_dashboard_data.py`. The frontend is decoupled from the modeling pipeline and only relies on the generated JSON artifact.
