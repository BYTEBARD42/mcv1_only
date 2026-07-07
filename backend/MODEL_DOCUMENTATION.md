# Gavi MCV1 Forecasting Model Documentation

## Executive Summary
This document outlines the methodology, data pipeline, and results of the MCV1 (Measles-Containing Vaccine dose 1) forecasting model. Designed for both strategic business planning and technical scalability, the model leverages demographic trends to project future vaccination targets across multiple countries through 2030. 

*Note: This documentation covers the data and modeling architecture exclusively.*

## Data & Feature Engineering
The model uses historical demographic indicators and past vaccine administration records to predict future coverage.

**Base Data:**
- Population sizes and growth projections.
- Crude birth rates and total births.
- Infant and under-five mortality metrics.

**Engineered Features:**
To capture complex demographic dynamics, the following features are programmatically generated:
- **Mortality Ratios:** Infant and Under-5 deaths calculated relative to total births.
- **Lagged & Rolling Metrics:** A 3-year lag of MCV1 coverage and a 3-year rolling mean to capture historical momentum and baseline adherence.
- **Growth Rates:** Year-over-Year (YoY) percentage changes in births and overall population.

## Modeling Approach
The core predictive algorithm is a **Huber Regressor**, implemented via `scikit-learn`. 
- **Why Huber Regressor?** It is highly robust to outliers. Vaccination data often contains anomalies (like sudden reporting drops or pandemic disruptions). The Huber Regressor minimizes the impact of these extreme outliers on the overall forecast.
- **Data Scaling:** All inputs are standardized (`StandardScaler`) to ensure features with large absolute numbers (like total population) don't overpower percentage-based features (like growth rates).
- **Validation:** The model is evaluated using TimeSeries Split cross-validation, ensuring that past data is strictly used to predict future data without data leakage.

## Model Performance (2020-2024 Backtest)
The model was subjected to a recursive backtest against actual data from 2020 to 2024 to determine its real-world accuracy.

**Overall System Accuracy:**
- **Mean Absolute Error (MAE):** 56.2
- **Mean Absolute Percentage Error (MAPE):** 10.26%

**Accuracy by Country:**
- **Kyrgyzstan:** MAPE of **4.76%** (Highly accurate)
- **Lesotho:** MAPE of **13.33%**
- **Uzbekistan:** MAPE of **12.70%**

An overall error margin of ~10% indicates the model is a highly reliable mechanism for medium-to-long-term resource allocation.

## Key Forecasting Results (Out to 2030)
Using UN medium-variant demographic projections, the model forecasts the following baseline MCV1 targets by the year 2030:
- **Kyrgyzstan:** 188,945 
- **Lesotho:** 59,734 
- **Uzbekistan:** 1,130,330 

## Advanced Analytical Engines
Beyond a single point-estimate forecast, the data pipeline runs three advanced analytical engines to help the business account for uncertainty:

1. **Scenario Engine:** Models specific macro-events (e.g., "Optimistic", "Pessimistic", or "Pandemic Shock") by adjusting future birth and mortality projections up or down by pre-defined percentages.
2. **Monte Carlo Engine:** Runs 300 statistical simulations injecting historical error distributions into future demographic data. This generates robust 50% and 90% confidence intervals around the baseline forecast.
3. **Sensitivity Analyzer:** Automatically perturbs key inputs (like infant mortality or net migration) by ±10% one-at-a-time (OAT) to quantify exactly which demographic shifts would impact the MCV1 forecast the most.
