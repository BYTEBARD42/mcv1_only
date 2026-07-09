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
        <div className="px-2.5">
          <span className="inline-flex rounded-md bg-white px-2.5 py-2 ring-1 ring-line dark:ring-white/10">
            <img
              src={`${import.meta.env.BASE_URL}gavi-logo.png`}
              alt="Gavi – The Vaccine Alliance"
              className="h-12 w-auto"
            />
          </span>
          <div className="mt-2.5 leading-tight">
            <div className="text-[13px] font-semibold tracking-tightish text-ink dark:text-white">
              MCV1 Forecast
            </div>
            <div className="text-[10.5px] text-zinc-400">Procurement Intelligence</div>
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

        <div className="mt-6 px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Scope
        </div>
        <div className="mt-1.5 space-y-1.5 rounded-md border border-line px-3 py-2.5 dark:border-white/[0.06]">
          <SideStat label="Countries" value={String(data.countries.length)} />
          <SideStat label="Horizon" value={`${data.meta.horizon[0]}–${data.meta.horizon[1]}`} />
          <SideStat label="Price / dose" value={`$${data.costConfig.pricePerDose}`} />
          <SideStat label="Presentation" value={data.costConfig.presentation} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1 px-1.5">
          {data.countries.map((c) => (
            <span
              key={c}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10.5px] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-300"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-6 px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Reliability
        </div>
        <div className="mt-1.5 rounded-md border border-line px-3 py-2.5 dark:border-white/[0.06]">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Model accuracy</span>
            <span className="text-[15px] font-semibold tabular-nums text-ink dark:text-white">
              {(100 - data.meta.modelMAPE).toFixed(1)}%
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-400">
            {data.meta.modelMAPE}% MAPE · walk-forward backtest
          </div>
          <div className="mt-2.5 space-y-1 border-t border-line pt-2 dark:border-white/[0.06]">
            {Object.entries(data.meta.backtestMAPE).map(([c, m]) => (
              <SideStat key={c} label={c} value={`${(m as number).toFixed(1)}%`} />
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-md border border-line px-3 py-2.5 dark:border-white/[0.06]">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Delivered by
            </div>
            <div className="mt-2">
              <span className="inline-flex rounded bg-white px-2 py-1.5 ring-1 ring-line dark:ring-white/10">
                <img
                  src={`${import.meta.env.BASE_URL}tech-mahindra-logo.jpg`}
                  alt="Tech Mahindra"
                  className="h-8 w-auto"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = "none";
                    img.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <span className="hidden text-[13px] font-bold text-[#e2136e]">Tech Mahindra</span>
              </span>
            </div>
            <div className="mt-2 text-[10px] text-zinc-400">Data: UNICEF · WHO · UN WPP</div>
          </div>

          <div className="flex rounded-md border border-line p-0.5 dark:border-white/10">
            <button
              onClick={() => setDark(false)}
              className={`seg-btn flex-1 py-1.5 ${!dark ? "seg-btn-active" : "seg-btn-idle"}`}
            >
              Light
            </button>
            <button
              onClick={() => setDark(true)}
              className={`seg-btn flex-1 py-1.5 ${dark ? "seg-btn-active" : "seg-btn-idle"}`}
            >
              Dark
            </button>
          </div>
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
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 lg:flex">
                <span className="text-[11px] font-medium text-zinc-400">Sources</span>
                <SourceLink href="https://www.gavi.org">Gavi</SourceLink>
                <SourceLink href="https://data.unicef.org/topic/child-health/immunization/">
                  UNICEF
                </SourceLink>
                <SourceLink href="https://immunizationdata.who.int/">WHO</SourceLink>
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

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 rounded-md border border-line px-2 py-1 text-[11.5px] font-medium text-zinc-600 transition-colors hover:border-teal hover:text-teal dark:border-white/10 dark:text-zinc-300 dark:hover:border-teal dark:hover:text-teal"
    >
      {children}
      <span aria-hidden className="text-[9px]">↗</span>
    </a>
  );
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <span className="text-[11.5px] font-medium tabular-nums text-ink dark:text-white">{value}</span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] px-6 text-center text-zinc-500 dark:bg-navy-900">
      <div>{children}</div>
    </div>
  );
}
