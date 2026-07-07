Design a modern, premium, dark-themed analytics dashboard for "Gavi MCV2 Vaccination Forecast Dashboard". This is a business intelligence tool for a healthcare/vaccination organization that forecasts MCV2 (Measles-Containing Vaccine dose 2) targets across 3 countries — Kyrgyzstan, Lesotho, and Uzbekistan — from 2025 to 2030. The dashboard has 6 pages/tabs. Design all 6 pages at 1440×900 desktop resolution.

COLOR PALETTE:
- Background: #0f0f23 (deep dark navy)
- Card backgrounds: #1a1a35 with subtle glassmorphism (10% white overlay, 20px blur, 1px semi-transparent border)
- Primary accent: #3498db (blue)
- Success/Optimistic: #2ecc71 (green)
- Danger/Pessimistic: #e74c3c (red)
- Warning/Pandemic: #9b59b6 (purple)
- Historical data line: #8b95a5 (gray)
- Text primary: #e8e8f0
- Text secondary: #6c7a8d
- Dividers: #2a2a4a
- Highlight/accent: #e67e22 (orange)
- Chart grid lines: #1e1e3a (very subtle)

TYPOGRAPHY:
- Font family: Inter or DM Sans
- Dashboard title: 24px bold
- Page titles: 20px semibold
- Card titles/labels: 12px medium uppercase tracking-wide, text-secondary color
- KPI values: 32px bold
- KPI sub-values: 14px regular
- Body text: 14px regular
- Table headers: 12px semibold uppercase
- Table data: 13px regular

GLOBAL LAYOUT:
- Left sidebar: 72px wide, dark (#0a0a1e), with icon-only navigation for the 6 pages — using icons: dashboard grid, map pin, git branch, bar chart, sliders, shield check. Active state shows a blue accent bar on the left edge and the icon in #3498db. Inactive icons in #4a4a6a.
- Top bar: 60px tall, contains the dashboard title "Gavi MCV2 Forecast Dashboard" on the left, a country selector dropdown (pill-shaped, showing "All Countries" by default), and a small badge "2025–2030 | Model Accuracy: 89.74%" on the right.
- Content area: remaining space with 24px padding, vertically scrollable.

===== PAGE 1: EXECUTIVE OVERVIEW =====

This is the landing page. Clean, executive-friendly, big numbers and one major chart.

ROW 1 — KPI Cards (4 cards in a horizontal row, equal width, 100px tall):
Card 1: Label "TOTAL BIRTHS (2025)" — Value "1,920,739" — small green arrow icon with "+2.1% vs 2024". Icon: baby/birth icon.
Card 2: Label "MCV2 FORECAST (2025)" — Value "1,085,910" — small blue dot. Icon: syringe icon.
Card 3: Label "MCV2 FORECAST (2030)" — Value "974,136" — small orange dot. Icon: target icon.
Card 4: Label "5-YEAR CHANGE" — Value "-10.3%" — displayed in red color with a downward arrow. Icon: trending-down icon.

Each card has the glassmorphism style, with the icon in the top-left corner (20px, tinted with the respective accent color), the label below it, and the large value centered.

ROW 2 — Main Chart (takes full width, 360px tall):
Title: "Historical & Forecasted MCV2 Targets (in thousands)"
A line chart with:
- X-axis: Years from 2000 to 2030 (labeled every 5 years)
- Y-axis: MCV2 Target (thousands), range 0–1000
- 3 colored lines (one per country): Kyrgyzstan (#3498db blue), Lesotho (#2ecc71 green), Uzbekistan (#e67e22 orange)
- Each line has a solid segment from 2000–2024 (historical) and a DASHED segment from 2025–2030 (forecast)
- A vertical dashed line at year 2024 with a small label "Forecast →" 
- Small circular data point markers on each year
- A legend in the top-right corner showing the 3 country colors
- Subtle grid lines on both axes
- Bottom-right corner: a small "🔍 Drag to zoom" hint text

ROW 3 — Summary Table (full width, compact):
Title: "Forecast Summary (MCV2 Target in thousands)"
A clean table with columns: Country | 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | Trend
3 rows for the 3 countries. The "Trend" column contains a tiny sparkline (miniature line chart) showing the 6-year trajectory. Values are formatted like "137,854", "39,259", "908,797".
Table has alternating row backgrounds (#1a1a35 and #151530), rounded corners, no harsh borders.

===== PAGE 2: COUNTRY DEEP-DIVE =====

This page focuses on one country at a time with detailed demographics.

TOP — Country Tabs: 
3 large tab buttons: "🇰🇬 Kyrgyzstan" (active, blue underline), "🇱🇸 Lesotho", "🇺🇿 Uzbekistan". Active tab has white text and a 3px blue bottom border. Inactive tabs have gray text.

ROW 1 — Demographic Profile Cards (6 cards in a 3×2 grid, each ~200px wide × 100px tall):
Card 1: "TOTAL POPULATION" — "7,295,034" — small line sparkline showing upward trend
Card 2: "BIRTHS (2025)" — "149,483" — sparkline
Card 3: "CRUDE BIRTH RATE" — "20.49 per 1,000" — sparkline
Card 4: "INFANT MORTALITY RATE" — "11.71 per 1,000" — sparkline trending down (green)
Card 5: "UNDER-5 MORTALITY" — "14.14 per 1,000" — sparkline trending down (green)
Card 6: "NET MIGRATION" — "+1,815" — sparkline

Each card: glassmorphism, the label in small uppercase gray, the value large and white, and a 60px wide sparkline in the bottom-right corner.

ROW 2 — Age Distribution Chart (left half, 280px tall):
Title: "Population Age Distribution (2025)"
A horizontal grouped bar chart showing population ages 0–5 for the selected country.
- Y-axis labels: "Age 0", "Age 1", "Age 2", "Age 3", "Age 4", "Age 5"
- Bars colored in a blue gradient (lightest at age 0, darkest at age 5)
- Values shown at the end of each bar (e.g., "148.4K")
- A year selector dropdown above: "Year: 2025 ▼"

ROW 2 — MCV2 Forecast Detail (right half, 280px tall):
Title: "MCV2 Forecast Trajectory"
A focused line chart showing just the selected country from 2015–2030 with:
- Historical solid line (2015–2024) in gray
- Forecast dashed line (2025–2030) in blue
- Data point markers with value labels
- Shaded area under the forecast line (very light blue fill)

ROW 3 — Demographic Trends (6 small multiples in a 3×2 grid, each ~200px wide × 140px tall):
Each is a mini line chart with:
- Title above (e.g., "Total Population", "Births", "Birth Rate", "Infant Mortality Rate", "Under-5 Mortality", "Net Migration")
- Single line from 2000–2030
- Solid portion (2000–2024 historical) and dashed portion (2025–2030 projected)
- No legend needed, just the trend line
- Subtle fill under the line
- Y-axis values on the left, years on bottom (show only 2000, 2010, 2020, 2030)

===== PAGE 3: SCENARIO ANALYSIS =====

This page shows what-if scenarios. Very visual and comparative.

ROW 1 — Scenario Legend Cards (4 cards in a row, each with a colored left border):
Card 1: Left border #3498db (blue) — "BASELINE" — "UN medium-variant projections, no adjustments"
Card 2: Left border #2ecc71 (green) — "OPTIMISTIC" — "Strong health system, declining mortality (IMR ×0.85, Births ×1.02)"
Card 3: Left border #e74c3c (red) — "PESSIMISTIC" — "Health system stress, rising mortality (IMR ×1.15, Births ×0.95)"
Card 4: Left border #9b59b6 (purple) — "PANDEMIC SHOCK" — "COVID-like disruption (Migration ×0.3, Births ×0.97)"
Each card: glassmorphism, compact (60px tall), scenario name bold, description in smaller gray text.

ROW 2 — Scenario Comparison Charts (3 charts side by side, one per country, each ~380px wide × 300px tall):
Each chart titled with the country name (e.g., "Kyrgyzstan — Scenario Forecast").
Contents:
- 4 colored lines (Baseline blue, Optimistic green, Pessimistic red, Pandemic purple)
- X-axis: 2020–2030 (historical portion 2020–2024 in gray, then scenarios diverge from 2025)
- Y-axis: MCV2 Target
- Small legend in each chart
- The lines should clearly diverge after the 2024 mark, showing different trajectories
- "🔍 Drag to zoom" hint text

ROW 3 — Scenario Impact Table (full width):
Title: "Scenario Impact Summary (2030 MCV2 Forecast)"
Columns: Country | Baseline | Optimistic | Pessimistic | Pandemic | Best Case Δ | Worst Case Δ
3 rows. The "Δ" columns show percentage differences like "+4.2%" (green) or "−8.7%" (red).
Clean table styling as in Page 1.

===== PAGE 4: MONTE CARLO SIMULATION =====

This page shows probabilistic confidence intervals. Premium data visualization.

ROW 1 — Simulation Parameters Card (full width, 50px tall, subtle):
A thin info bar: "🎲 500 Simulations | Births ±5% | IMR ±10% | Block Bootstrap Residuals"

ROW 2 — Fan Charts (3 charts side by side, one per country, each ~380px wide × 320px tall):
Each chart titled: "Monte Carlo Forecast — [Country Name]"
Contents:
- X-axis: Years (2018–2030)
- Y-axis: MCV2 Target (thousands)
- Historical data (2018–2024): solid gray line with dot markers
- FROM 2025 onward, show a "fan" / confidence interval visualization:
  - Outermost band (P5 to P95): very light blue fill (#3498db at 10% opacity), labeled "90% CI"
  - Inner band (P25 to P75): medium blue fill (#3498db at 30% opacity), labeled "50% CI"
  - Median line (P50): solid blue line, 2px thick
- The fan shape should widen slightly as it extends further into the future (more uncertainty)
- The historical line should connect seamlessly to the median forecast line
- Legend showing: "— Historical", shaded bands labeled "50% CI" and "90% CI", "— Median (P50)"

ROW 3 — Confidence Interval Table (full width):
Title: "Forecast Confidence Intervals (2025–2030)"
Columns: Country | Year | P5 | P25 | Median (P50) | P75 | P95 | Range
Expandable/collapsible by country. Show all 18 rows (3 countries × 6 years).
The "Range" column shows "P5–P95" as a formatted range like "125.4K – 148.2K".

===== PAGE 5: SENSITIVITY ANALYSIS =====

This page answers "which inputs matter most?" with tornado and elasticity charts.

TOP — Controls Bar:
Country selector: "Kyrgyzstan ▼" and Year selector: "2026 ▼" as pill-shaped dropdowns.

ROW 1 — Tornado Diagram (full width, 350px tall):
Title: "Sensitivity Tornado — Kyrgyzstan (2026)"
Subtitle: "Impact of ±5% perturbation on each demographic input"
A horizontal bar chart (tornado style):
- Y-axis (left): Feature names (7 features), sorted by absolute impact (most impactful at top):
  1. "Births (thousands)"
  2. "Pop Age 0 (thousands)"
  3. "Crude Birth Rate"
  4. "Infant Mortality Rate"
  5. "Under-5 Mortality Rate"
  6. "Net Migration"
  7. "Net Migration Rate"
- X-axis (bottom): "% Change in MCV2 Forecast" centered at 0
- For each feature, TWO horizontal bars extending from center:
  - Blue bar extending RIGHT = impact of +5% increase
  - Red bar extending LEFT = impact of −5% decrease
- Vertical black line at x=0
- Values shown at the end of each bar (e.g., "+0.8%", "−0.6%")
- The most impactful features have the longest bars

ROW 2 — Elasticity Curve (left half, 280px tall) + Feature Importance Ranking (right half):

LEFT — Elasticity Curve:
Title: "Elasticity Curve — Births (thousands)"
Subtitle: "How does changing this input affect the forecast?"
- X-axis: "% Change in Feature" from −20% to +20%
- Y-axis: "% Change in MCV2 Forecast"
- A single green line showing the response curve
- Dashed reference lines at x=0 and y=0 (black)
- The curve should be roughly linear but may show slight curvature
- Feature selector dropdown above: "Feature: Births (thousands) ▼"

RIGHT — Feature Importance Ranking:
Title: "Feature Impact Ranking"
A vertical list of 7 features with colored impact badges:
1. "Births" — 🔴 HIGH IMPACT (red badge)
2. "Pop Age 0" — 🔴 HIGH IMPACT
3. "Birth Rate" — 🟡 MEDIUM IMPACT (yellow badge)
4. "IMR" — 🟡 MEDIUM IMPACT
5. "U5 Mortality" — 🟢 LOW IMPACT (green badge)
6. "Net Migration" — 🟢 LOW IMPACT
7. "Migration Rate" — 🟢 LOW IMPACT
Each row has: rank number, feature name, a thin horizontal bar (width proportional to impact), and the colored badge.

===== PAGE 6: MODEL PERFORMANCE =====

This page builds trust by showing model accuracy and methodology.

ROW 1 — Accuracy KPI Cards (4 cards in a row):
Card 1: "OVERALL MAPE" — "10.26%" — with a circular progress ring (89.74% filled in green = accuracy)
Card 2: "KYRGYZSTAN MAPE" — "4.76%" — progress ring (95.24% green)
Card 3: "LESOTHO MAPE" — "13.33%" — progress ring (86.67% yellow-ish)
Card 4: "UZBEKISTAN MAPE" — "12.70%" — progress ring (87.3% yellow-ish)
Each card: glassmorphism, ring chart centered, label above, value below the ring.

ROW 2 — Backtest Chart (full width, 300px tall):
Title: "Model Backtest: Actual vs Predicted (2020–2024)"
3 small line charts side by side (one per country):
- Each shows TWO lines: Solid line = "Actual" (gray), Dashed line = "Predicted" (blue)
- X-axis: 2020, 2021, 2022, 2023, 2024
- Y-axis: MCV2 Target
- The closer the lines are, the better the model
- Shaded area between the two lines (light red/blue fill showing the error gap)
- Label showing the country name and its MAPE value

ROW 3 — Methodology Card (full width, 200px tall):
A clean card with 4 columns showing the data pipeline:
Column 1: Icon of a database — "DATA" — "25 years of demographic data, UN population projections for 3 countries"
Column 2: Icon of gears — "FEATURES" — "17 engineered features including lagged values, rolling means, growth rates, mortality ratios"
Column 3: Icon of a brain/model — "MODEL" — "Huber Regressor — robust to outliers, standardized inputs, TimeSeries cross-validation"
Column 4: Icon of a checkmark — "VALIDATION" — "3-fold TimeSeries CV, MAE: 56.2, recursive backtest 2020–2024"
These 4 columns are connected by a horizontal arrow/flow line, showing the pipeline left-to-right.

Overall design should feel like a premium fintech or healthcare analytics platform — think Bloomberg Terminal meets modern SaaS dashboards. Clean spacing, subtle shadows, no clutter. Every element should have generous padding (16–24px) and rounded corners (8–12px radius).
