"use client";

import type { PerformancePeriod } from "@/types/staff";
import { cn } from "@/utils/cn";

const PERIODS: { id: PerformancePeriod; label: string; hint: string }[] = [
  { id: "day", label: "Day", hint: "Today" },
  { id: "week", label: "Week", hint: "This week" },
  { id: "month", label: "Month", hint: "This month" },
  { id: "year", label: "Year", hint: "This year" },
  { id: "custom", label: "Custom", hint: "Pick dates" },
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
            title={period.hint}
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
