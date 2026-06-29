"use client";

import type { PerformancePeriod } from "@/types/staff";
import { cn } from "@/utils/cn";

const PERIODS: { id: PerformancePeriod; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom" },
];

type PeriodSwitcherDefaultProps = {
  activePeriod: PerformancePeriod;
  onChange: (period: PerformancePeriod) => void;
  className?: string;
};

export default function PeriodSwitcherDefault({
  activePeriod,
  onChange,
  className,
}: PeriodSwitcherDefaultProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {PERIODS.map((period) => {
        const isActive = period.id === activePeriod;

        return (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(period.id)}
            className={cn(
              "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "bg-accent-dim text-muted-foreground hover:text-foreground",
            )}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
