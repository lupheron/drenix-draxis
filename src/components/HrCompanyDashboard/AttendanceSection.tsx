"use client";

import Link from "next/link";
import AttendanceTimezoneToggle from "@/components/Attendance/AttendanceTimezoneToggle";
import {
  EmployeeAttendanceCard,
  groupAttendanceByEmployee,
} from "@/components/HrCompanyDashboard/EmployeeAttendanceCard";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import { useAttendanceDays } from "@/hooks/useAttendanceAdmin";
import { useAttendanceTimezone } from "@/hooks/useAttendanceTimezone";
import type { AttendanceDay, CompanyCode, Employee } from "@/lib/types";
import { authStorage } from "@/lib/auth-storage";
import {
  countCheckedInDays,
  countLateDays,
  countNoShowDays,
  resolveDisplayDayStatus,
} from "@/utils/attendance-display";
import { formatApiError } from "@/utils/portal-errors";

type Props = {
  company: CompanyCode;
  from: string;
  to: string;
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
};

function rollupSummary(days: AttendanceDay[]) {
  let pending = 0;
  let missingPunch = 0;
  for (const day of days) {
    const display = resolveDisplayDayStatus(day);
    if (display === "pending_review") pending += 1;
    if (day.status === "missing_punch") missingPunch += 1;
  }
  return {
    noShows: countNoShowDays(days),
    lates: countLateDays(days),
    checkedIn: countCheckedInDays(days),
    pending,
    missingPunch,
  };
}

export default function AttendanceSection({
  company,
  from,
  to,
  employees,
  onSelectEmployee,
}: Props) {
  const canManage = authStorage.canAccessAttendance();
  const { timezone, setTimezone } = useAttendanceTimezone();
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
  const cards = groupAttendanceByEmployee(rows, employees);
  const summary = rollupSummary(rows);

  function handleCardClick(summary: (typeof cards)[number]) {
    if (summary.employee) {
      onSelectEmployee(summary.employee);
      return;
    }
    const matched = employees.find((e) => e.id === summary.employeeId);
    if (matched) {
      onSelectEmployee(matched);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
              HikVision attendance
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {company} · shift dates {from} → {to}. Click a person for full
              attendance history, RingCentral, and leads.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <AttendanceTimezoneToggle timezone={timezone} onChange={setTimezone} />
            {canManage ? (
              <Link
                href={`/attendance/manage?company=${company}&from=${from}&to=${to}`}
                className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
              >
                Manage days →
              </Link>
            ) : null}
          </div>
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
          id="att-checked-in"
          label="Checked in"
          value={String(summary.checkedIn)}
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
        <h2 className="text-lg font-light text-foreground">
          Team · {cards.length} employees
        </h2>
        {cards.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <EmployeeAttendanceCard
                key={card.employeeId}
                summary={card}
                timezone={timezone}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        ) : (
          <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
            No attendance records in this period.
          </p>
        )}
      </section>
    </div>
  );
}
