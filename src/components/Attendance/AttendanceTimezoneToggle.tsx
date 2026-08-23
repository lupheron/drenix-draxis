"use client";

import {
  ATTENDANCE_TIMEZONE_LABELS,
  ATTENDANCE_TIMEZONES,
  type AttendanceTimezone,
} from "@/utils/attendance-display";
import { cn } from "@/utils/cn";

type Props = {
  timezone: AttendanceTimezone;
  onChange: (timezone: AttendanceTimezone) => void;
  className?: string;
};

export default function AttendanceTimezoneToggle({
  timezone,
  onChange,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
        Clock
      </span>
      <div className="flex border border-border">
        {ATTENDANCE_TIMEZONES.map((tz) => (
          <button
            key={tz}
            type="button"
            onClick={() => onChange(tz)}
            className={cn(
              "px-3 py-1.5 text-xs transition-colors",
              timezone === tz
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent-dim/50",
            )}
          >
            {ATTENDANCE_TIMEZONE_LABELS[tz]}
          </button>
        ))}
      </div>
    </div>
  );
}
