import numpy as np
import pandas as pd
from sklearn.linear_model import HuberRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit, cross_val_score

TARGET = "MCV1_TARGET"
SPLIT_YEAR = 2025
COUNTRIES = ['Kyrgyzstan', 'Lesotho', 'Uzbekistan']

# ──feature set ────────────────────────────────────────────────
FEATURE_COLS = [
    'Year',
    'Total Population, as of 1 January (thousands)',
    'Total Population, as of 1 July (thousands)',
    'Births (thousands)',
    'Crude Birth Rate (births per 1,000 population)',
    'Infant Deaths, under age 1 (thousands)',
    'Infant Mortality Rate (infant deaths per 1,000 live births)',
    'Under-Five Deaths, under age 5 (thousands)',
    'Under-Five Mortality (deaths under age 5 per 1,000 live births)',
    'Net Number of Migrants (thousands)',
    'Net Migration Rate (per 1,000 population)',
    'Pop_Age_0(In Thousands)',
    'Births_per_1000pop',
    'Infant_mort_ratio',
    'U5_mort_ratio',
    'Net_migration_abs',
    'Years_since_2000',
    'is_pandemic_year',
    'MCV1_lag_1',
    'MCV1_lag_2',
    'MCV1_lag_3',
    'MCV1_roll3_mean',
    'MCV1_roll5_mean',
    'Coverage_roll3_mean',
    'MCV1_roll3_std',
    'Births_roll3_std',
    'MCV1_YoY_growth',
    'Births_YoY_growth',
    'Population_YoY_growth',
    'BirthRate_change',
    'InfantMortality_change',
    'Country_Lesotho',
    'Country_Uzbekistan',
]


def engineer_features(df_in, target_col=TARGET):
    df = df_in.copy()
    df = df.sort_values(["Country", "Year"]).reset_index(drop=True)

    # ── derived ratios 
    df["Births_per_1000pop"] = (
        df["Births (thousands)"]
        / df["Total Population, as of 1 July (thousands)"] * 1000
    )
    df["Infant_mort_ratio"] = (
        df["Infant Deaths, under age 1 (thousands)"]
        / df["Births (thousands)"]
    )
    df["U5_mort_ratio"] = (
        df["Under-Five Deaths, under age 5 (thousands)"]
        / df["Births (thousands)"]
    )
    df["MCV1_lag_3"] = df.groupby("Country")[target_col].shift(3)
    df["MCV1_roll3_mean"] = df.groupby("Country")[target_col].transform(
        lambda x: x.shift(1).rolling(3, min_periods=1).mean()
    )
    df["Births_YoY_growth"] = df.groupby("Country")[
        "Births (thousands)"
    ].transform(lambda x: x.pct_change().shift(1))

    df["Population_YoY_growth"] = df.groupby("Country")[
        "Total Population, as of 1 July (thousands)"
    ].transform(lambda x: x.pct_change().shift(1))

    df["BirthRate_change"] = df.groupby("Country")[
        "Crude Birth Rate (births per 1,000 population)"
    ].transform(lambda x: x.diff().shift(1))

    df["InfantMortality_change"] = df.groupby("Country")[
        "Infant Mortality Rate (infant deaths per 1,000 live births)"
    ].transform(lambda x: x.diff().shift(1))
    
    # ── new features 
    df["Net_migration_abs"] = df["Net Number of Migrants (thousands)"].abs()
    df["Years_since_2000"] = df["Year"] - 2000
    df["is_pandemic_year"] = df["Year"].isin([2020, 2021]).astype(int)
    
    df["MCV1_lag_1"] = df.groupby("Country")[target_col].shift(1)
    df["MCV1_lag_2"] = df.groupby("Country")[target_col].shift(2)
    
    df["MCV1_roll5_mean"] = df.groupby("Country")[target_col].transform(
        lambda x: x.shift(1).rolling(5, min_periods=1).mean()
    )
    
    df["Coverage"] = df[target_col] / df["Pop_Age_0(In Thousands)"]
    df["Coverage_roll3_mean"] = df.groupby("Country")["Coverage"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=1).mean()
    )
    
    df["MCV1_roll3_std"] = df.groupby("Country")[target_col].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).std().fillna(0)
    )
    
    df["Births_roll3_std"] = df.groupby("Country")["Births (thousands)"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).std().fillna(0)
    )
    
    df["MCV1_YoY_growth"] = df.groupby("Country")[target_col].transform(
        lambda x: x.pct_change().shift(1)
    )

    df["Country_Lesotho"] = (df["Country"] == "Lesotho").astype(int)
    df["Country_Uzbekistan"] = (df["Country"] == "Uzbekistan").astype(int)
    required_history = ["MCV1_lag_3", "Births_YoY_growth"]
    df = df.dropna(subset=required_history).copy()

    return df, FEATURE_COLS, None


def recursive_forecast(df_raw, model, feature_cols, dummy_cols, split_year,
                       target_col=TARGET, future_demo_df=None):
    results = []

    if future_demo_df is not None:
        years_to_predict = sorted(future_demo_df["Year"].unique().tolist())
    else:
        years_to_predict = sorted(
            df_raw[df_raw["Year"] >= split_year]["Year"].unique().tolist()
        )

    # Cache retrained models in backtest mode to avoid redundant training per country
    retrained_models = {}

    for country in COUNTRIES:
        country_raw = df_raw[
            (df_raw["Country"] == country) & (df_raw["Year"] < split_year)
        ].copy()

        if future_demo_df is not None:
            country_future = (
                future_demo_df[future_demo_df["Country"] == country]
                .sort_values("Year")
                .reset_index(drop=True)
            )
        else:
            country_future = (
                df_raw[
                    (df_raw["Country"] == country)
                    & (df_raw["Year"] >= split_year)
                ]
                .sort_values("Year")
                .reset_index(drop=True)
            )

        for year in years_to_predict:
            try:
                raw_row = country_future[
                    country_future["Year"] == year
                ].iloc[0:1].copy()
            except IndexError:
                continue
            
            # 1. Walk-forward validation: retrain on all actual data strictly before year Y
            if future_demo_df is None:
                if year not in retrained_models:
                    print(f"\n--- Walk-forward retraining for year {year} ---")
                    # train_model uses data < split_year (which is 'year' here)
                    m, _, _, _ = train_model(df_raw, split_year=year, target_col=target_col)
                    retrained_models[year] = m
                current_model = retrained_models[year]
            else:
                current_model = model

            current_raw = pd.concat([country_raw, raw_row], ignore_index=True)
            engineered_df, _, _ = engineer_features(current_raw, target_col)

            try:
                X_row_df = engineered_df[
                    engineered_df["Year"] == year
                ].iloc[0:1]
                X_row = X_row_df[feature_cols].copy()
            except IndexError:
                continue

            # 2. Predict year Y using that freshly retrained model (or fixed model if forecasting)
            pred = current_model.predict(X_row)[0]
            actual = raw_row.iloc[0].get(target_col, np.nan)

            results.append({
                "Country": country,
                "Year": year,
                "Predicted": pred,
                "Actual": actual,
            })

            # 3. Add the value to the training data before moving to year Y+1
            if future_demo_df is not None:
                # Forecast mode: feed predicted value back in
                raw_row[target_col] = pred
            else:
                # Backtest mode: add the actual value
                raw_row[target_col] = actual

            country_raw = pd.concat(
                [country_raw, raw_row], ignore_index=True
            )

    return pd.DataFrame(results)


def mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = y_true != 0
    return (
        np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    )


def train_model(df_raw, split_year=SPLIT_YEAR, target_col=TARGET):
    df_full, feature_cols, _ = engineer_features(df_raw, target_col)
    train = df_full[df_full["Year"] < split_year].copy()
    train = train.sort_values(["Year", "Country"]).reset_index(drop=True)

    X_train = train[feature_cols].copy()
    y_train = train[target_col]
    model = Pipeline([
    ("scaler", StandardScaler()),
    ("model", HuberRegressor(epsilon=1.35, alpha=0.0001, max_iter=2000)),
])
    tscv = TimeSeriesSplit(n_splits=3)
    cv_scores = cross_val_score(
        model, X_train, y_train, cv=tscv, scoring="neg_mean_absolute_error"
    )
    print(f"TimeSeries CV MAE Scores: {-cv_scores}")
    print(f"Average CV MAE: {-cv_scores.mean():.3f}")
    model.fit(X_train, y_train)

    return model, df_raw, feature_cols, None