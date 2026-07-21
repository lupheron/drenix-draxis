"use client";

import { cn } from "@/utils/cn";

export type MetricsSourceFilter = "all" | "ringcentral" | "monday" | "neither";

const OPTIONS: { id: MetricsSourceFilter; label: string; title: string }[] = [
  {
    id: "all",
    label: "All sources",
    title: "RingCentral + Monday.com",
  },
  {
    id: "ringcentral",
    label: "RingCentral",
    title: "Calls, minutes, outbound/inbound/missed/voicemail",
  },
  {
    id: "monday",
    label: "Monday.com",
    title: "Leads, Follow-up, Hired, Loaded, Rejected",
  },
  {
    id: "neither",
    label: "Neither",
    title: "Hide RingCentral and Monday metrics",
  },
];

type MetricsSourceSwitcherProps = {
  active: MetricsSourceFilter;
  onChange: (source: MetricsSourceFilter) => void;
  className?: string;
};

export default function MetricsSourceSwitcherDefault({
  active,
  onChange,
  className,
}: MetricsSourceSwitcherProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {OPTIONS.map((option) => {
        const isActive = option.id === active;

        return (
          <button
            key={option.id}
            type="button"
            title={option.title}
            onClick={() => onChange(option.id)}
            className={cn(
              "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "bg-accent-dim text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
