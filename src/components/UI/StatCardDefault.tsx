import type { StatMetric } from "@/types/logistics";
import { cn } from "@/utils/cn";

type StatCardDefaultProps = StatMetric & {
  className?: string;
};

export default function StatCardDefault({
  label,
  value,
  change,
  trend = "neutral",
  className,
}: StatCardDefaultProps) {
  return (
    <div
      className={cn(
        "border border-border bg-surface p-5 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl tracking-tight text-foreground">
        {value}
      </p>
      {change ? (
        <p
          className={cn(
            "mt-2 text-xs",
            trend === "up" && "text-success",
            trend === "down" && "text-danger",
            trend === "neutral" && "text-muted-foreground",
          )}
        >
          {change}
        </p>
      ) : null}
    </div>
  );
}
