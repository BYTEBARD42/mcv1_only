# MCV1 Procurement Intelligence — Business Documentation

**Purpose:** help planning, finance, and programme teams use the MCV1 forecast dashboard to
size **vaccine procurement volumes and budgets** for Kyrgyzstan, Lesotho, and Uzbekistan
through 2030, and to stress-test those plans against uncertainty and what-if conditions.
**Audience:** Gavi/UNICEF programme managers, procurement & finance, country planners.

---

## 1. What this tool answers

- **How many MCV1 doses** will each country need each year to 2030?
- **What will that cost** at the Gavi/UNICEF 10-dose price of **US$0.318/dose**?
- **How much could the budget swing** given demographic and reporting uncertainty?
- **What if conditions change** — stronger systems, stress, or a pandemic-style coverage drop?
- **Which factors move the number most**, so monitoring can focus there?

Everything shown is computed from official data — **no hard-coded figures**.

---

## 2. Where the numbers come from

| Input | Source |
|---|---|
| Population, births, mortality, migration | UN **World Population Prospects** (history + medium-variant projections) |
| Historical MCV1 targets | **WHO/UNICEF** immunization data |
| Vaccine unit cost | **Gavi/UNICEF** 10-dose measles presentation — **US$0.318/dose** |

The forecast uses a statistical model validated against 2020–2024 actuals with an average error
of **2.68%** (see §6) — reliable enough for medium-term budgeting.

---

## 3. How to read a "target"

The core number, the **MCV1 target**, is the **quantity of doses to procure per year** — already
including the standard **25% wastage** allowance for 10-dose vials. The dashboard lets you view
every chart through two lenses:

- **US$ (budget)** — the default, procurement cost.
- **Doses (demand)** — procurement quantity.

A **wastage slider (0–50%, default 25%)** lets you see how budget and demand change if vials are
used more or less efficiently. At 25% it matches the official target; move it and cost/demand
update instantly.

---

## 4. Headline outlook (2030, baseline, at 25% wastage)

| Country | 2030 doses | 2030 budget | 6-year cumulative budget (2025–2030) |
|---|---|---|---|
| **Uzbekistan** | ~1,163,700 | **US$370,059** | **US$2.26M** |
| **Kyrgyzstan** | ~187,700 | **US$59,697** | **US$358k** |
| **Lesotho** | ~55,200 | **US$17,565** | **US$110k** |
| **All three** | — | — | **≈ US$2.73M** |

*Figures regenerate from the model; treat as the central (baseline) case.*

---

## 5. The four dashboard pages

1. **Overview** — the board summary: headline budget & doses, the historical-to-forecast
   trajectory with an uncertainty band, the scenario budget range, and a model-reliability panel.
2. **Forecast & Demographics** — the trajectory in detail, a year-by-year table (children
   covered, doses, budget), and the demographic drivers (births, mortality) behind it.
3. **Uncertainty (Monte Carlo)** — the range of plausible budgets and the **budget-at-risk**
   (how much extra to hold as contingency).
4. **Scenarios & Sensitivity** — the **scenario planner** and the driver **tornado**.

---

## 6. Trusting the forecast

The model was tested by predicting **2020–2024 as if unknown** and comparing to actuals:

- **Overall error: 2.68%** (Uzbekistan 0.86%, Kyrgyzstan 1.01%, Lesotho 6.18%).
- Lesotho is less precise because its birth cohort is small, so year-to-year swings are larger in
  percentage terms. Treat Lesotho figures with a wider margin.

Lower error = higher confidence for resource allocation. The Overview page shows these figures live.

---

## 7. Planning with uncertainty (Monte Carlo)

The forecast is a **central estimate**, not a certainty. The Uncertainty page runs 500 simulations
to produce a range:

- **P50 (median)** — the central budget to plan around.
- **P95 (high)** — a prudent ceiling; the gap **P95 − P50** is your **contingency / budget-at-risk**.
- **P5 (low)** — the best case; **P50 − P5** is potential saving.

Use P50 for the base budget and hold the budget-at-risk as a reserve.

---

## 8. Scenario planner (what-if)

The planner adjusts the baseline with **two transparent levers**, so results are predictable:

- **Cohort / demand shock (± %)** — more or fewer children to vaccinate (birth-rate changes,
  survival, migration). Scales doses and budget proportionally.
- **Coverage shock (± percentage points)** — the share of children actually reached. This is the
  lever that models a **pandemic-style coverage collapse** (missed vaccinations).

**Presets** set both levers at once:

| Scenario | Levers | Effect on 2030 budget* |
|---|---|---|
| **Optimistic** | +2% cohort, +5pp coverage | ≈ **+7 to +8.5%** |
| **Pessimistic** | −3% cohort, −5pp coverage | ≈ **−8 to −9%** |
| **Pandemic** | −3% cohort, −15pp coverage | ≈ **−17 to −22%** |

*Consistent across all three countries. Drag either slider to build a custom scenario; the chart
shows a shaded **planning envelope** between the pessimistic and optimistic cases.*

> Note: "budget down" in the pessimistic/pandemic cases reflects **fewer doses administered**
> because coverage/demand falls — it is a programme risk (children missed), not a saving to bank.

---

## 9. What moves the forecast most (sensitivity)

The **tornado** chart ranks demographic drivers by how much a ±5% change moves the target.
Typically **birth cohort size (`Pop Age 0`) and births** dominate. Practical use: prioritise data
quality and monitoring on the top drivers, since errors there translate most directly into budget error.

---

## 10. Exporting for reports

The toolbar **Report** buttons download a CSV that merges the **forecast with the future
demographics** — one row per country-year with target, children covered, doses, budget (at your
current wastage setting), and the underlying births/mortality/migration. Download the current
country or **All** countries for board packs and finance submissions.

---

## 11. Important caveats for decision-makers

1. **Cost is vaccine procurement only** — it excludes freight, cold-chain, and delivery.
2. **Wastage is an assumption** (default 25%); the slider lets finance test its budget impact.
3. **"Effective coverage" can read slightly above 100%** in the forecast (e.g. Uzbekistan ~102%)
   when projected doses exceed the modelled birth cohort — a normal artifact (catch-up, migration,
   cohort-estimate differences), shown honestly rather than hidden.
4. **Three countries, one vaccine** — the tool covers MCV1 for Kyrgyzstan, Lesotho, Uzbekistan.
5. Figures are **decision support**, not a commitment; pair the P50 with the budget-at-risk reserve.

---

## 12. One-line summary

*Baseline central budget to fully fund MCV1 across the three countries for 2025–2030 is
**≈ US$2.73M**, dominated by Uzbekistan (~83%), with a model accuracy of ~97% and a scenario
range of roughly ±20% depending on coverage and demographic conditions.*
