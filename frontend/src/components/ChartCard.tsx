import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5 dark:border-white/[0.06]">
        <div>
          <h3 className="section-title">{title}</h3>
          {subtitle && <p className="muted mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
