"use client";

import AttendanceDayDetail from "@/components/Attendance/AttendanceDayDetail";
import AttendanceStatusPill from "@/components/Attendance/AttendanceStatusPill";
import AttendanceTimezoneToggle from "@/components/Attendance/AttendanceTimezoneToggle";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { useAttendanceEmployeeDays } from "@/hooks/useAttendanceAdmin";
import { useAttendanceTimezone } from "@/hooks/useAttendanceTimezone";
import type { Employee } from "@/lib/types";
import { resolveDisplayDayStatus } from "@/utils/attendance-display";
import { formatApiError } from "@/utils/portal-errors";
import { cn } from "@/utils/cn";
import { useState } from "react";

type Props = {
  employee: Employee;
  from: string;
  to: string;
};

export default function EmployeeAttendanceHistory({
  employee,
  from,
  to,
}: Props) {
  const { timezone, setTimezone } = useAttendanceTimezone();
  const [expandedDayId, setExpandedDayId] = useState<number | null>(null);
  const { data: days, isLoading, isError, error } = useAttendanceEmployeeDays(
    employee.id,
    from,
    to,
  );

  const rows = days ?? [];

  if (isLoading) {
    return <EyeLoadingDefault size="md" label="Loading attendance history" />;
  }

  if (isError) {
    return (
      <p className="text-sm text-danger">{formatApiError(error)}</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
        No shift days for this period.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Shift-date history
        </p>
        <AttendanceTimezoneToggle timezone={timezone} onChange={setTimezone} />
      </div>

      <div className="space-y-2">
        {rows.map((day) => {
          const expanded = expandedDayId === day.id;
          return (
            <article
              key={day.id}
              className={cn(
                "border border-border bg-surface",
                resolveDisplayDayStatus(day) === "no_show" && "border-danger/20",
                resolveDisplayDayStatus(day) === "late" && "border-warning/20",
              )}
            >
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
                onClick={() =>
                  setExpandedDayId(expanded ? null : day.id)
                }
              >
                <div>
                  <p className="text-sm text-foreground">{day.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.late_minutes
                      ? `${day.late_minutes} min late`
                      : "On time"}
                  </p>
                </div>
                <AttendanceStatusPill day={day} />
              </button>
              {expanded ? (
                <div className="border-t border-border px-4 py-4">
                  <AttendanceDayDetail day={day} timezone={timezone} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
