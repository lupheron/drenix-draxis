import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function ChartCard({
  title,
  description,
  badge,
  children,
  footer,
}: ChartCardProps) {
  return (
    <section className="border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium tracking-wide text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {badge ? (
          <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="h-72">{children}</div>
      {footer ? <div className="mt-4 flex flex-wrap gap-2">{footer}</div> : null}
    </section>
  );
}

export function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-sm border border-border bg-accent-dim/40 px-3 py-1.5 text-xs text-muted-foreground">
      <span className="text-foreground">{value}</span> · {label}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-light text-foreground">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
