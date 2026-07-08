import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  sub,
  hint,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="card card-pad" title={hint}>
      <div className="flex items-center gap-1 kpi-label">
        {label}
        {hint && <span className="text-zinc-300 dark:text-zinc-600">·</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="muted mt-1.5">{sub}</div>}
    </div>
  );
}
