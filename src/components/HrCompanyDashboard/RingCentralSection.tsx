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
  formatTalkTime,
  hrChartColors,
  shortName,
} from "@/components/HrCompanyDashboard/SectionNav";
import type { CompanyHrAnalytics, Employee } from "@/lib/types";

type Props = {
  data: CompanyHrAnalytics;
  employees: Employee[];
};

export default function RingCentralSection({ data, employees }: Props) {
  const labels = employees.map((e) => shortName(e));

  const stacked = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Outbound",
          data: employees.map((e) => e.metrics?.outbound_calls ?? 0),
          backgroundColor: hrChartColors.outbound,
          stack: "rc",
        },
        {
          label: "Inbound",
          data: employees.map((e) => e.metrics?.inbound_calls ?? 0),
          backgroundColor: hrChartColors.inbound,
          stack: "rc",
        },
        {
          label: "Missed",
          data: employees.map((e) => e.metrics?.missed_calls ?? 0),
          backgroundColor: hrChartColors.missed,
          stack: "rc",
        },
        {
          label: "Voicemail",
          data: employees.map((e) => e.metrics?.voicemail_calls ?? 0),
          backgroundColor: hrChartColors.voicemail,
          stack: "rc",
        },
      ],
    }),
    [employees, labels],
  );

  const minutesSplit = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Outbound min",
          data: employees.map((e) => e.metrics?.outbound_minutes ?? 0),
          backgroundColor: hrChartColors.outbound,
        },
        {
          label: "Inbound min",
          data: employees.map((e) => e.metrics?.inbound_minutes ?? 0),
          backgroundColor: hrChartColors.inbound,
        },
      ],
    }),
    [employees, labels],
  );

  const directionMix = useMemo(() => {
    const outbound = data.outbound_calls ?? employees.reduce(
      (sum, e) => sum + (e.metrics?.outbound_calls ?? 0),
      0,
    );
    const inbound = data.inbound_calls ?? employees.reduce(
      (sum, e) => sum + (e.metrics?.inbound_calls ?? 0),
      0,
    );
    const missed = data.missed_calls ?? employees.reduce(
      (sum, e) => sum + (e.metrics?.missed_calls ?? 0),
      0,
    );
    const voicemail = data.voicemail_calls ?? employees.reduce(
      (sum, e) => sum + (e.metrics?.voicemail_calls ?? 0),
      0,
    );
    return {
      labels: ["Outbound", "Inbound", "Missed", "Voicemail"],
      datasets: [
        {
          data: [outbound, inbound, missed, voicemail],
          backgroundColor: [
            hrChartColors.outbound,
            hrChartColors.inbound,
            hrChartColors.missed,
            hrChartColors.voicemail,
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, employees]);

  const outbound =
    data.outbound_calls ??
    employees.reduce((sum, e) => sum + (e.metrics?.outbound_calls ?? 0), 0);
  const missed =
    data.missed_calls ??
    employees.reduce((sum, e) => sum + (e.metrics?.missed_calls ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="rc-users"
          label="Users"
          value={String(data.employee_count ?? employees.length)}
        />
        <StatCardDefault
          id="rc-calls"
          label="Total calls"
          value={String(data.calls_made ?? 0)}
          change="RingCentral"
        />
        <StatCardDefault
          id="rc-talk"
          label="Talk time"
          value={formatTalkTime(data.minutes_on_call ?? 0)}
        />
        <StatCardDefault
          id="rc-out"
          label="Outbound"
          value={String(outbound)}
        />
        <StatCardDefault id="rc-missed" label="Missed" value={String(missed)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Calls by user"
          description="Outbound / inbound / missed / voicemail"
        >
          <Bar data={stacked} options={barOptions(true)} />
        </ChartPanel>
        <ChartPanel
          title="Company direction mix"
          description="All users combined"
        >
          <Doughnut data={directionMix} options={doughnutOptions()} />
        </ChartPanel>
        <ChartPanel
          title="Minutes by user"
          description="Outbound vs inbound talk time"
          className="xl:col-span-2"
        >
          <Bar data={minutesSplit} options={barOptions(false)} />
        </ChartPanel>
      </div>
    </div>
  );
}
