"use client";

import AttendanceStatusPill from "@/components/Attendance/AttendanceStatusPill";
import type { AttendanceDay, Employee } from "@/lib/types";
import {
  formatAttendanceClock,
  formatAttendanceTimeOnly,
  parseDayEvents,
  resolveDisplayDayStatus,
  type AttendanceTimezone,
} from "@/utils/attendance-display";
import { employeeLabel } from "@/components/HrCompanyDashboard/SectionNav";
import { cn } from "@/utils/cn";

export type EmployeeAttendanceSummary = {
  employeeId: number;
  name: string;
  employee: Employee | null;
  days: AttendanceDay[];
  latestDay: AttendanceDay | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  noShows: number;
  lates: number;
  shiftDays: number;
};

export function groupAttendanceByEmployee(
  days: AttendanceDay[],
  employees: Employee[],
): EmployeeAttendanceSummary[] {
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const buckets = new Map<number, AttendanceDay[]>();

  for (const day of days) {
    const id = day.employee_id;
    if (!id) continue;
    const list = buckets.get(id) ?? [];
    list.push(day);
    buckets.set(id, list);
  }

  const summaries: EmployeeAttendanceSummary[] = [];

  for (const [employeeId, employeeDays] of buckets) {
    const sorted = [...employeeDays].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const latestDay = sorted[0] ?? null;
    const parsed = latestDay ? parseDayEvents(latestDay.events) : null;
    const employee = employeeById.get(employeeId) ?? null;
    const name =
      employee
        ? employeeLabel(employee)
        : latestDay?.employee_name?.trim() ||
          employeeDays.find((d) => d.employee_name?.trim())?.employee_name ||
          `Employee #${employeeId}`;

    let noShows = 0;
    let lates = 0;
    for (const day of employeeDays) {
      const display = resolveDisplayDayStatus(day);
      if (display === "no_show") noShows += 1;
      if (display === "late") lates += 1;
    }

    summaries.push({
      employeeId,
      name,
      employee,
      days: sorted,
      latestDay,
      checkInAt: parsed?.checkIn?.occurred_at ?? null,
      checkOutAt: parsed?.checkOut?.occurred_at ?? null,
      noShows,
      lates,
      shiftDays: employeeDays.length,
    });
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name));
}

type CardProps = {
  summary: EmployeeAttendanceSummary;
  timezone: AttendanceTimezone;
  onClick: () => void;
};

export function EmployeeAttendanceCard({
  summary,
  timezone,
  onClick,
}: CardProps) {
  const latest = summary.latestDay;
  const display = latest ? resolveDisplayDayStatus(latest) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-3 border border-border bg-surface p-5 text-left transition-colors hover:border-border-strong hover:bg-accent-dim/30",
        display === "no_show" && "border-danger/30",
        display === "late" && "border-warning/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base text-foreground">{summary.name}</p>
          {latest ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Latest shift · {latest.date}
            </p>
          ) : null}
        </div>
        {latest ? <AttendanceStatusPill day={latest} /> : null}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
            Check-in
          </dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {summary.checkInAt
              ? formatAttendanceTimeOnly(summary.checkInAt, timezone)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
            Check-out
          </dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {summary.checkOutAt
              ? formatAttendanceTimeOnly(summary.checkOutAt, timezone)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
            Late min
          </dt>
          <dd className="mt-0.5 text-foreground">
            {latest?.late_minutes ? `${latest.late_minutes} min` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
            Period
          </dt>
          <dd className="mt-0.5 text-muted-foreground">
            {summary.shiftDays} days · {summary.lates} late · {summary.noShows}{" "}
            no-show
          </dd>
        </div>
      </dl>

      {summary.checkInAt ? (
        <p className="text-xs text-muted">
          {formatAttendanceClock(summary.checkInAt, timezone)}
        </p>
      ) : null}

      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
        View attendance & performance →
      </span>
    </button>
  );
}
