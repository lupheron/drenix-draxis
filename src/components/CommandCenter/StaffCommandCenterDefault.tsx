"use client";

import { useMemo, useState } from "react";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import DepartmentSwitcherDefault from "@/components/UI/DepartmentSwitcherDefault";
import PeriodSwitcherDefault from "@/components/UI/PeriodSwitcherDefault";
import HrStaffTableDefault from "@/components/CommandCenter/HrStaffTableDefault";
import GradeBadgeDefault from "@/components/UI/GradeBadgeDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import { DEPARTMENTS } from "@/constants/departments";
import { MOCK_EMPLOYEES } from "@/constants/staff-data";
import type { PerformancePeriod } from "@/types/staff";
import { exportStaffToExcel } from "@/utils/export-staff";
import {
  formatCurrency,
  formatDate,
  formatMinutes,
  formatShiftLabel,
} from "@/utils/formatters";
import {
  getPeriodDateRange,
  rankEmployees,
} from "@/utils/staff-performance";
import { cn } from "@/utils/cn";

export default function StaffCommandCenterDefault() {
  const [departmentId, setDepartmentId] = useState("all");
  const [period, setPeriod] = useState<PerformancePeriod>("week");
  const [customFrom, setCustomFrom] = useState("2026-06-01");
  const [customTo, setCustomTo] = useState("2026-06-19");
  const [exportFrom, setExportFrom] = useState("2026-06-01");
  const [exportTo, setExportTo] = useState("2026-06-19");
  const [search, setSearch] = useState("");

  const customRange =
    period === "custom" ? { from: customFrom, to: customTo } : undefined;

  const rankedEmployees = useMemo(
    () => rankEmployees(MOCK_EMPLOYEES, period, departmentId, customRange),
    [period, departmentId, customFrom, customTo],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rankedEmployees;

    return rankedEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(query),
    );
  }, [rankedEmployees, search]);

  const topPerformer = rankedEmployees[0];
  const isHrView = departmentId === "hr";
  const periodRange =
    period === "custom"
      ? { from: customFrom, to: customTo }
      : getPeriodDateRange(period);

  const summaryStats = useMemo(() => {
    const totalCalls = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.callsMade,
      0,
    );
    const totalHires = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.hires,
      0,
    );
    const totalMinutes = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.minutesSpoken,
      0,
    );
    const monitored = rankedEmployees.filter(
      (employee) => employee.status === "close_monitor",
    ).length;

    return { totalCalls, totalHires, totalMinutes, monitored };
  }, [rankedEmployees]);

  function handleExport() {
    const exportData = rankEmployees(
      MOCK_EMPLOYEES,
      "custom",
      departmentId,
      { from: exportFrom, to: exportTo },
    );

    exportStaffToExcel(exportData, exportFrom, exportTo, departmentId);
  }

  return (
    <>
      <PageHeaderDefault
        title="Command Center"
        description="Staff performance intelligence — call activity, hiring output, and ranked operational scores."
        actions={
          <InputDefault
            placeholder="Search staff..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56"
            aria-label="Search staff"
          />
        }
      />

      <div className="space-y-6 px-8 py-8">
        <DepartmentSwitcherDefault
          departments={DEPARTMENTS}
          activeId={departmentId}
          onChange={setDepartmentId}
        />

        <div className="flex flex-col gap-4 border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
              Performance Window
            </p>
            <PeriodSwitcherDefault
              activePeriod={period}
              onChange={setPeriod}
              className="mt-3"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(periodRange.from)} — {formatDate(periodRange.to)}
          </p>
        </div>

        {period === "custom" ? (
          <div className="grid gap-4 border border-border bg-surface p-5 sm:grid-cols-2">
            <InputDefault
              label="From"
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
            <InputDefault
              label="To"
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardDefault
            id="top-performer"
            label="Top Performer"
            value={topPerformer?.name ?? "—"}
            change={
              topPerformer
                ? `Score ${topPerformer.performance.score} · ${topPerformer.grade}`
                : undefined
            }
            trend="up"
          />
          <StatCardDefault
            id="total-calls"
            label="Total Calls"
            value={summaryStats.totalCalls.toLocaleString()}
            change="RingCentral feed"
            trend="neutral"
          />
          <StatCardDefault
            id="total-hires"
            label="Total Hires"
            value={String(summaryStats.totalHires)}
            change="Recruiting output"
            trend="up"
          />
          <StatCardDefault
            id="close-monitor"
            label="Close Monitor"
            value={String(summaryStats.monitored)}
            change={`${formatMinutes(summaryStats.totalMinutes)} spoken`}
            trend="down"
          />
        </div>

        <div className="border border-border bg-surface">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-medium tracking-wide text-foreground">
                {isHrView ? "HR Staff Ledger" : "Staff Performance"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {isHrView
                  ? "Attendance, call activity, lead pipeline, and compensation — sorted by performance score."
                  : "Sorted by performance score. Rank reflects position within the selected period."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <InputDefault
                label="Export from"
                type="date"
                value={exportFrom}
                onChange={(event) => setExportFrom(event.target.value)}
                wrapperClassName="min-w-36"
              />
              <InputDefault
                label="Export to"
                type="date"
                value={exportTo}
                onChange={(event) => setExportTo(event.target.value)}
                wrapperClassName="min-w-36"
              />
              <ButtonDefault
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="mb-0.5 shrink-0"
              >
                Export to Excel
              </ButtonDefault>
            </div>
          </div>

          {isHrView ? (
            <HrStaffTableDefault employees={filteredEmployees} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    {[
                      "Rank",
                      "Name",
                      "Birthday",
                      "Joined",
                      "Shift",
                      "Salary",
                      "Grade",
                      "Status",
                      "Score",
                      "Calls",
                      "Recordings",
                      "Hires",
                      "Minutes",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.15em] text-muted"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="px-4 py-12 text-center text-sm text-muted"
                      >
                        No staff records match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className={cn(
                          "border-b border-border last:border-b-0 hover:bg-accent-dim/30",
                          employee.rank === 1 && "bg-success/5",
                          employee.status === "close_monitor" && "bg-warning/5",
                        )}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "font-mono text-sm",
                              employee.rank <= 3
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            #{employee.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-foreground">{employee.name}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(employee.birthday)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(employee.joinedDate)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatShiftLabel(employee.shift)}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground">
                          {formatCurrency(employee.salary)}
                        </td>
                        <td className="px-4 py-3">
                          <GradeBadgeDefault grade={employee.grade} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadgeDefault
                            status={employee.status}
                            variant={
                              employee.status === "close_monitor"
                                ? "warning"
                                : "muted"
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-foreground">
                            {employee.performance.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {employee.performance.callsMade}
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {employee.performance.recordingsCount}
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {employee.performance.hires}
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {formatMinutes(employee.performance.minutesSpoken)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {topPerformer ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {rankedEmployees.slice(0, 3).map((employee, index) => (
              <article
                key={employee.id}
                className="border border-border bg-surface p-5"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  {index === 0
                    ? "Best of period"
                    : index === 1
                      ? "Second"
                      : "Third"}{" "}
                  ·{" "}
                  {period === "custom"
                    ? "Custom range"
                    : period.charAt(0).toUpperCase() + period.slice(1)}
                </p>
                <p className="mt-3 text-lg text-foreground">{employee.name}</p>
                <div className="mt-4 flex items-center gap-3">
                  <GradeBadgeDefault grade={employee.grade} />
                  <span className="font-mono text-sm text-muted-foreground">
                    Score {employee.performance.score}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <dt>Calls</dt>
                    <dd className="font-mono text-foreground">
                      {employee.performance.callsMade}
                    </dd>
                  </div>
                  <div>
                    <dt>Hires</dt>
                    <dd className="font-mono text-foreground">
                      {employee.performance.hires}
                    </dd>
                  </div>
                  <div>
                    <dt>Recordings</dt>
                    <dd className="font-mono text-foreground">
                      {employee.performance.recordingsCount}
                    </dd>
                  </div>
                  <div>
                    <dt>Minutes</dt>
                    <dd className="font-mono text-foreground">
                      {formatMinutes(employee.performance.minutesSpoken)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
