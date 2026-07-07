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
    'Births (thousands)',
    'Crude Birth Rate (births per 1,000 population)',
    'Infant Deaths, under age 1 (thousands)',
    'Infant Mortality Rate (infant deaths per 1,000 live births)',
    'Net Migration Rate (per 1,000 population)',
    'Pop_Age_0(In Thousands)',
    'Births_per_1000pop',
    'Infant_mort_ratio',
    'U5_mort_ratio',
    'MCV1_lag_3',
    'MCV1_roll3_mean',
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

            current_raw = pd.concat([country_raw, raw_row], ignore_index=True)
            engineered_df, _, _ = engineer_features(current_raw, target_col)

            try:
                X_row_df = engineered_df[
                    engineered_df["Year"] == year
                ].iloc[0:1]
                X_row = X_row_df[feature_cols].copy()
            except IndexError:
                continue

            pred = model.predict(X_row)[0]
            actual = raw_row.iloc[0].get(target_col, np.nan)

            results.append({
                "Country": country,
                "Year": year,
                "Predicted": pred,
                "Actual": actual,
            })

            raw_row[target_col] = pred
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