"use client";

import "@/components/Analytics/chartSetup";

import { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import StatCardDefault from "@/components/UI/StatCardDefault";
import {
  ChartPanel,
  barOptions,
  doughnutOptions,
} from "@/components/HrCompanyDashboard/ChartPanel";
import {
  employeeLabel,
  formatTalkTime,
  hrChartColors,
  shortName,
} from "@/components/HrCompanyDashboard/SectionNav";
import type { CompanyHrAnalytics, Employee } from "@/lib/types";

type AnalyticsSectionProps = {
  data: CompanyHrAnalytics;
  employees: Employee[];
  onSelectPerson: (employee: Employee) => void;
};

export default function AnalyticsSection({
  data,
  employees,
  onSelectPerson,
}: AnalyticsSectionProps) {
  const labels = useMemo(
    () => employees.map((employee) => shortName(employee)),
    [employees],
  );

  const callsByUser = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Outbound",
          data: employees.map((e) => e.metrics?.outbound_calls ?? 0),
          backgroundColor: hrChartColors.outbound,
          stack: "calls",
        },
        {
          label: "Inbound",
          data: employees.map((e) => e.metrics?.inbound_calls ?? 0),
          backgroundColor: hrChartColors.inbound,
          stack: "calls",
        },
        {
          label: "Missed",
          data: employees.map((e) => e.metrics?.missed_calls ?? 0),
          backgroundColor: hrChartColors.missed,
          stack: "calls",
        },
      ],
    }),
    [employees, labels],
  );

  const talkTimeByUser = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Minutes",
          data: employees.map((e) => e.metrics?.minutes_on_call ?? 0),
          backgroundColor: hrChartColors.minutes,
        },
      ],
    }),
    [employees, labels],
  );

  const callsShare = useMemo(() => {
    const values = employees.map((e) => e.metrics?.calls_made ?? 0);
    const palette = [
      hrChartColors.outbound,
      hrChartColors.inbound,
      hrChartColors.missed,
      hrChartColors.leads,
      hrChartColors.loaded,
      hrChartColors.followUp,
    ];
    return {
      labels: employees.map((e) => employeeLabel(e)),
      datasets: [
        {
          data: values,
          backgroundColor: employees.map(
            (_, index) => palette[index % palette.length],
          ),
          borderWidth: 0,
        },
      ],
    };
  }, [employees]);

  const mondayByUser = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: employees.map((e) => e.metrics?.leads ?? 0),
          backgroundColor: hrChartColors.leads,
        },
        {
          label: "Follow-up",
          data: employees.map((e) => e.metrics?.follow_up ?? 0),
          backgroundColor: hrChartColors.followUp,
        },
        {
          label: "Loaded",
          data: employees.map((e) => e.metrics?.loaded ?? 0),
          backgroundColor: hrChartColors.loaded,
        },
        {
          label: "Rejected",
          data: employees.map((e) => e.metrics?.rejected ?? 0),
          backgroundColor: hrChartColors.rejected,
        },
      ],
    }),
    [employees, labels],
  );

  const pipelineShare = useMemo(() => {
    const values = [
      data.leads ?? 0,
      data.follow_up ?? 0,
      data.hires ?? 0,
      data.loaded ?? 0,
      data.rejected ?? 0,
    ];
    return {
      labels: ["Leads", "Follow-up", "Hired", "Loaded", "Rejected"],
      datasets: [
        {
          data: values,
          backgroundColor: [
            hrChartColors.leads,
            hrChartColors.followUp,
            hrChartColors.hired,
            hrChartColors.loaded,
            hrChartColors.rejected,
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const topCaller = useMemo(() => {
    return [...employees].sort(
      (a, b) => (b.metrics?.calls_made ?? 0) - (a.metrics?.calls_made ?? 0),
    )[0];
  }, [employees]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="users"
          label="HR employees"
          value={String(data.employee_count ?? employees.length)}
        />
        <StatCardDefault
          id="calls"
          label="Total calls"
          value={String(data.calls_made ?? 0)}
          change="RingCentral"
        />
        <StatCardDefault
          id="talk"
          label="Talk time"
          value={formatTalkTime(data.minutes_on_call ?? 0)}
          change="All users"
        />
        <StatCardDefault
          id="leads"
          label="Leads"
          value={String(data.leads ?? 0)}
          change="Monday.com"
        />
        <StatCardDefault
          id="loaded"
          label="Loaded"
          value={String(data.loaded ?? 0)}
          change="First load / real hire"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Company overview for this period
        {topCaller
          ? ` · Top caller: ${employeeLabel(topCaller)} (${topCaller.metrics?.calls_made ?? 0} calls)`
          : ""}
        . Click a person in People for individual detail.
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Inbound / outbound / missed by user"
          description="RingCentral call mix across the team"
        >
          <Bar data={callsByUser} options={barOptions(true)} />
        </ChartPanel>
        <ChartPanel
          title="Talk time by user"
          description="Minutes on call in selected range"
        >
          <Bar data={talkTimeByUser} options={barOptions(false)} />
        </ChartPanel>
        <ChartPanel
          title="Calls share by user"
          description="Who owns the call volume"
        >
          <Doughnut data={callsShare} options={doughnutOptions()} />
        </ChartPanel>
        <ChartPanel
          title="Monday pipeline mix"
          description="Company totals across lead stages"
        >
          <Doughnut data={pipelineShare} options={doughnutOptions()} />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Monday metrics by user"
        description="Leads, follow-up, loaded, rejected"
      >
        <Bar data={mondayByUser} options={barOptions(false)} />
      </ChartPanel>

      <section className="border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Team snapshot</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a row to open that person&apos;s section.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                {[
                  "Name",
                  "Calls",
                  "Minutes",
                  "Outbound",
                  "Missed",
                  "Leads",
                  "Loaded",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-accent-dim/40"
                  onClick={() => onSelectPerson(employee)}
                >
                  <td className="px-4 py-3 font-medium text-foreground underline decoration-border underline-offset-4">
                    {employeeLabel(employee)}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.calls_made ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.minutes_on_call ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.outbound_calls ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.missed_calls ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.leads ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {employee.metrics?.loaded ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
