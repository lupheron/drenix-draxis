"use client";

import Link from "next/link";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import { useAttendanceDays } from "@/hooks/useAttendanceAdmin";
import type { AttendanceDay, CompanyCode } from "@/lib/types";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/utils/cn";
import { formatApiError } from "@/utils/portal-errors";

type Props = {
  company: CompanyCode;
  from: string;
  to: string;
};

type PersonRollup = {
  name: string;
  days: number;
  noShows: number;
  lates: number;
  pending: number;
};

function rollupDays(days: AttendanceDay[]) {
  const byPerson = new Map<string, PersonRollup>();

  let noShows = 0;
  let lates = 0;
  let present = 0;
  let pending = 0;
  let missingPunch = 0;

  for (const day of days) {
    const isLate = day.status === "late" || day.late_minutes > 0;
    const isNoShow = day.status === "no_show" || day.no_show;

    if (isNoShow) noShows += 1;
    if (isLate) lates += 1;
    if (day.status === "present" || day.status === "excused") present += 1;
    if (day.status === "pending_review") pending += 1;
    if (day.status === "missing_punch") missingPunch += 1;

    const existing = byPerson.get(day.employee_name) ?? {
      name: day.employee_name,
      days: 0,
      noShows: 0,
      lates: 0,
      pending: 0,
    };
    existing.days += 1;
    if (isNoShow) existing.noShows += 1;
    if (isLate) existing.lates += 1;
    if (day.status === "pending_review") existing.pending += 1;
    byPerson.set(day.employee_name, existing);
  }

  return {
    noShows,
    lates,
    present,
    pending,
    missingPunch,
    byPerson: [...byPerson.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function statusLabel(status: AttendanceDay["status"]) {
  return status.replace(/_/g, " ");
}

function StatusPill({ status }: { status: AttendanceDay["status"] }) {
  const tone =
    status === "present" || status === "excused"
      ? "text-success"
      : status === "late" || status === "pending_review"
        ? "text-warning"
        : status === "no_show" || status === "missing_punch"
          ? "text-danger"
          : "text-muted-foreground";

  return (
    <span className={cn("text-xs uppercase tracking-[0.12em]", tone)}>
      {statusLabel(status)}
    </span>
  );
}

export default function AttendanceSection({ company, from, to }: Props) {
  const canManage = authStorage.canAccessAttendance();
  const { data: days, isLoading, isError, error } = useAttendanceDays({
    company,
    from,
    to,
  });

  if (isLoading) {
    return <EyeLoadingDefault size="lg" label="Loading HikVision attendance" />;
  }

  if (isError) {
    return (
      <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {formatApiError(error)}
      </p>
    );
  }

  const rows = days ?? [];
  const summary = rollupDays(rows);

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
              HikVision attendance
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {company} · synced from Laravel · {from} → {to}
            </p>
          </div>
          {canManage ? (
            <Link
              href={`/attendance?company=${company}`}
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
            >
              Manage days →
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="att-no-shows"
          label="No shows"
          value={String(summary.noShows)}
          trend="down"
        />
        <StatCardDefault
          id="att-lates"
          label="Lates"
          value={String(summary.lates)}
          trend="down"
        />
        <StatCardDefault
          id="att-present"
          label="Present / excused"
          value={String(summary.present)}
          trend="neutral"
        />
        <StatCardDefault
          id="att-pending"
          label="Pending review"
          value={String(summary.pending)}
          trend="down"
        />
        <StatCardDefault
          id="att-missing"
          label="Missing punch"
          value={String(summary.missingPunch)}
          trend="down"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">By person</h2>
        {summary.byPerson.length ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {["Name", "Days", "No shows", "Lates", "Pending"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {summary.byPerson.map((person) => (
                  <tr
                    key={person.name}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-foreground">{person.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {person.days}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        person.noShows > 0 ? "text-danger" : "text-muted-foreground",
                      )}
                    >
                      {person.noShows}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        person.lates > 0 ? "text-warning" : "text-muted-foreground",
                      )}
                    >
                      {person.lates}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {person.pending}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
            No attendance rows in this period.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">Days</h2>
        {rows.length ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {["Date", "Employee", "Status", "Late min", "No show", "Note"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((day) => (
                  <tr
                    key={day.id}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      day.status === "no_show" && "bg-danger/5",
                      day.status === "late" && "bg-warning/5",
                    )}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{day.date}</td>
                    <td className="px-4 py-3 text-foreground">
                      {day.employee_name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={day.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {day.late_minutes || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {day.no_show ? "Yes" : "No"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {day.admin_note ?? day.sheet_note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
            No attendance days for {company} in this date range.
          </p>
        )}
      </section>
    </div>
  );
}
