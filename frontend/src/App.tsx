import { useState } from "react";
import { useData } from "./lib/useData";
import { StoreProvider, useStore } from "./store";
import { ControlBar } from "./components/ControlBar";
import { Overview } from "./pages/Overview";
import { ForecastDemographics } from "./pages/ForecastDemographics";
import { Uncertainty } from "./pages/Uncertainty";
import { ScenariosSensitivity } from "./pages/ScenariosSensitivity";

const PAGES = [
  { id: "overview", label: "Overview", el: <Overview /> },
  { id: "forecast", label: "Forecast & demographics", el: <ForecastDemographics /> },
  { id: "uncertainty", label: "Uncertainty", el: <Uncertainty /> },
  { id: "scenarios", label: "Scenarios & sensitivity", el: <ScenariosSensitivity /> },
] as const;

function Shell() {
  const { data, dark, setDark } = useStore();
  const [page, setPage] = useState<string>("overview");
  const current = PAGES.find((p) => p.id === page)!;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-[236px] shrink-0 flex-col border-r border-line bg-white px-3 py-4 dark:border-white/[0.06] dark:bg-navy-800 lg:flex">
        <div className="flex items-center gap-2.5 px-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-[12px] font-bold text-white dark:bg-white dark:text-ink">
            M1
          </span>
          <div className="text-[13px] font-semibold tracking-tightish text-ink dark:text-white">
            MCV1 Forecast
          </div>
        </div>

        <div className="mt-6 px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Analysis
        </div>
        <nav className="mt-1.5 space-y-0.5">
          {PAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              className={`nav-link w-full text-left ${page === p.id ? "nav-link-active" : "nav-link-idle"}`}
            >
              {p.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-md border border-line px-3 py-2.5 dark:border-white/[0.06]">
            <div className="text-[11px] font-medium text-zinc-400">Model accuracy</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tabular-nums text-ink dark:text-white">
                {(100 - data.meta.modelMAPE).toFixed(1)}%
              </span>
              <span className="text-[11px] text-zinc-400">{data.meta.modelMAPE}% MAPE</span>
            </div>
          </div>
          <button onClick={() => setDark(!dark)} className="btn-ghost w-full">
            {dark ? "Light" : "Dark"} mode
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-[#fafafa]/95 px-6 py-3 dark:border-white/[0.06] dark:bg-navy-900/95">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[15px] font-semibold tracking-tightish text-ink dark:text-white">
                {current.label}
              </h1>
              <p className="muted mt-0.5">
                Gavi / UNICEF MCV1 procurement outlook · {data.meta.horizon[0]}–{data.meta.horizon[1]}
              </p>
            </div>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="field lg:hidden"
            >
              {PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-4 px-6 py-5">
          <ControlBar />
          {current.el}
          <footer className="pt-3 text-[11px] text-zinc-400">
            Sources: UN World Population Prospects (demographics) · WHO/UNICEF (MCV1) ·
            Cost basis: {data.costConfig.source}
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const state = useData();

  if (state.status === "loading") return <Centered>Loading forecast data…</Centered>;
  if (state.status === "error")
    return (
      <Centered>
        <div className="text-rose-500">Failed to load data.json — {state.error}</div>
        <div className="muted mt-2">
          Run <code className="rounded bg-zinc-100 px-1 dark:bg-white/10">python backend/generate_data.py</code> first.
        </div>
      </Centered>
    );

  return (
    <StoreProvider data={state.data}>
      <Shell />
    </StoreProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] px-6 text-center text-zinc-500 dark:bg-navy-900">
      <div>{children}</div>
    </div>
  );
}
