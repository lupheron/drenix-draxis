"use client";

import type { AttendanceDay } from "@/lib/types";
import {
  displayStatusLabel,
  displayStatusTone,
  resolveDisplayDayStatus,
} from "@/utils/attendance-display";
import { cn } from "@/utils/cn";

type Props = {
  day: Pick<AttendanceDay, "status" | "late_minutes" | "no_show">;
  className?: string;
};

export default function AttendanceStatusPill({ day, className }: Props) {
  const status = resolveDisplayDayStatus(day);

  return (
    <span
      className={cn(
        "text-xs uppercase tracking-[0.12em]",
        displayStatusTone(status),
        className,
      )}
    >
      {displayStatusLabel(status)}
    </span>
  );
}
