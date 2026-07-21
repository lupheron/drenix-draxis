"use client";

import "@/components/Analytics/chartSetup";

import { useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import ButtonDefault from "@/components/Button/ButtonDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import {
  ChartPanel,
  barOptions,
  doughnutOptions,
  lineOptions,
} from "@/components/HrCompanyDashboard/ChartPanel";
import {
  employeeLabel,
  formatTalkTime,
  hrChartColors,
} from "@/components/HrCompanyDashboard/SectionNav";
import { useRingCentralOverview } from "@/hooks/useEmployees";
import type { Employee } from "@/lib/types";
import { cn } from "@/utils/cn";

type Props = {
  employees: Employee[];
  selectedId: number | null;
  onSelect: (employee: Employee) => void;
  from: string;
  to: string;
  onOpenRingCentral: (employee: Employee) => void;
};

export default function PeopleSection({
  employees,
  selectedId,
  onSelect,
  from,
  to,
  onOpenRingCentral,
}: Props) {
  const selected =
    employees.find((employee) => employee.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            People · {employees.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a name for that person&apos;s charts
          </p>
        </div>
        <ul className="max-h-[70vh] overflow-y-auto p-2">
          {employees.map((employee) => {
            const active = employee.id === selectedId;
            const metrics = employee.metrics;
            return (
              <li key={employee.id}>
                <button
                  type="button"
                  onClick={() => onSelect(employee)}
                  className={cn(
                    "mb-1 flex w-full flex-col gap-1 border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-border-strong bg-accent-dim text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/40 hover:text-foreground",
                  )}
                >
                  <span className="text-sm font-medium">
                    {employeeLabel(employee)}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {metrics?.calls_made ?? 0} calls ·{" "}
                    {formatTalkTime(metrics?.minutes_on_call ?? 0)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="min-w-0">
        {selected ? (
          <PersonDetail
            employee={selected}
            from={from}
            to={to}
            onOpenRingCentral={() => onOpenRingCentral(selected)}
          />
        ) : (
          <div className="flex min-h-80 items-center justify-center border border-dashed border-border bg-surface px-6 text-center text-sm text-muted-foreground">
            Select a person on the left to see their RingCentral and Monday
            charts.
          </div>
        )}
      </div>
    </div>
  );
}

function PersonDetail({
  employee,
  from,
  to,
  onOpenRingCentral,
}: {
  employee: Employee;
  from: string;
  to: string;
  onOpenRingCentral: () => void;
}) {
  const metrics = employee.metrics;
  const overview = useRingCentralOverview(employee.id, from, to, true);

  const direction = useMemo(
    () => ({
      labels: ["Outbound", "Inbound", "Missed", "Voicemail"],
      datasets: [
        {
          data: [
            metrics?.outbound_calls ?? 0,
            metrics?.inbound_calls ?? 0,
            metrics?.missed_calls ?? 0,
            metrics?.voicemail_calls ?? 0,
          ],
          backgroundColor: [
            hrChartColors.outbound,
            hrChartColors.inbound,
            hrChartColors.missed,
            hrChartColors.voicemail,
          ],
          borderWidth: 0,
        },
      ],
    }),
    [metrics],
  );

  const mondayBars = useMemo(
    () => ({
      labels: ["Leads", "Follow-up", "Hired", "Loaded", "Rejected"],
      datasets: [
        {
          label: employee.first_name,
          data: [
            metrics?.leads ?? 0,
            metrics?.follow_up ?? 0,
            metrics?.hires ?? 0,
            metrics?.loaded ?? 0,
            metrics?.rejected ?? 0,
          ],
          backgroundColor: [
            hrChartColors.leads,
            hrChartColors.followUp,
            hrChartColors.hired,
            hrChartColors.loaded,
            hrChartColors.rejected,
          ],
        },
      ],
    }),
    [employee.first_name, metrics],
  );

  const dailyMissed = useMemo(() => {
    const daily = overview.data?.daily ?? [];
    return {
      labels: daily.map((row) => row.date ?? ""),
      datasets: [
        {
          label: "Missed",
          data: daily.map((row) => row.missed),
          borderColor: hrChartColors.missed,
          backgroundColor: "rgba(244,63,94,0.2)",
          fill: true,
          tension: 0.35,
        },
        {
          label: "Total calls",
          data: daily.map((row) => row.total_calls),
          borderColor: hrChartColors.calls,
          backgroundColor: "transparent",
          tension: 0.35,
        },
      ],
    };
  }, [overview.data?.daily]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-light text-foreground">
            {employeeLabel(employee)}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {employee.position ?? "HR"} · {employee.company ?? "—"}
          </p>
        </div>
        <ButtonDefault type="button" size="sm" onClick={onOpenRingCentral}>
          Open full RingCentral
        </ButtonDefault>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          id="p-calls"
          label="Calls"
          value={String(metrics?.calls_made ?? 0)}
        />
        <StatCardDefault
          id="p-talk"
          label="Talk time"
          value={formatTalkTime(metrics?.minutes_on_call ?? 0)}
        />
        <StatCardDefault
          id="p-leads"
          label="Leads"
          value={String(metrics?.leads ?? 0)}
        />
        <StatCardDefault
          id="p-loaded"
          label="Loaded"
          value={String(metrics?.loaded ?? 0)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Call direction split"
          description="This person · RingCentral"
        >
          <Doughnut data={direction} options={doughnutOptions()} />
        </ChartPanel>
        <ChartPanel
          title="Monday pipeline"
          description="This person · Monday.com"
        >
          <Bar data={mondayBars} options={barOptions(false)} />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Calls over time"
        description={
          overview.isLoading
            ? "Loading daily RingCentral…"
            : overview.isError
              ? "Could not load daily RingCentral"
              : "Missed vs total calls from RingCentral daily API"
        }
      >
        {overview.isLoading || overview.isError ? (
          overview.isLoading ? (
            <EyeLoadingDefault size="sm" label="Loading daily RingCentral" />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No daily RingCentral data for this period.
            </p>
          )
        ) : (
          <Line data={dailyMissed} options={lineOptions()} />
        )}
      </ChartPanel>
    </div>
  );
}
