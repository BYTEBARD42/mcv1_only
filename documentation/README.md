# Documentation

Two companion documents for the MCV1 procurement forecasting system.

| Document | Audience | Contents |
|---|---|---|
| [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) | Data scientists, engineers | Data sources, feature engineering, modelling technique (Huber + walk-forward), Monte Carlo, sensitivity, cost model, data contract, assumptions, limitations, fixed defects |
| [BUSINESS_DOCUMENTATION.md](BUSINESS_DOCUMENTATION.md) | Programme, procurement, finance | What the tool answers, headline outlook, how to read targets/budgets, scenario planning, uncertainty, exports, decision caveats |

**Countries:** Kyrgyzstan · Lesotho · Uzbekistan  ·  **Horizon:** 2025–2030
**Pipeline:** [`backend/generate_data.py`](../backend/generate_data.py) → `frontend/public/data.json` → React dashboard.

All figures in both documents are recomputed by the pipeline; regenerate with
`python backend/generate_data.py`.
