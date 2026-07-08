import type { Lens } from "../types";
import { fmtLens } from "../lib/format";

interface Row {
  name: string;
  display: string;
  color: string;
}

// Range-band series (e.g. P5–P95) arrive as a [low, high] tuple; format as a range.
function displayValue(v: unknown, lens: Lens): string | null {
  if (Array.isArray(v)) {
    const [a, b] = v as number[];
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return `${fmtLens(a, lens, false)} – ${fmtLens(b, lens, false)}`;
  }
  if (typeof v === "number" && Number.isFinite(v)) return fmtLens(v, lens, false);
  return null;
}

/** Generic Recharts tooltip that formats every series in the active lens' unit. */
export function LensTooltip({
  active,
  payload,
  label,
  lens,
  note,
}: {
  active?: boolean;
  payload?: any[];
  label?: any;
  lens: Lens;
  note?: string;
}) {
  if (!active || !payload?.length) return null;
  const rows: Row[] = payload
    .map((p) => ({ name: p.name, display: displayValue(p.value, lens), color: p.color || p.stroke }))
    .filter((r): r is Row => r.display != null);
  if (!rows.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy-800/95">
      <div className="mb-1 text-xs font-semibold text-navy dark:text-white">{label}</div>
      <div className="space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
            <span className="font-mono font-semibold tabular-nums text-navy dark:text-white">
              {r.display}
            </span>
          </div>
        ))}
      </div>
      {note && <div className="mt-1.5 max-w-[220px] text-[10px] leading-tight text-slate-400">{note}</div>}
    </div>
  );
}
