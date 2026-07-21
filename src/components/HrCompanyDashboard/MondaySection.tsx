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
  hrChartColors,
  shortName,
} from "@/components/HrCompanyDashboard/SectionNav";
import type { CompanyHrAnalytics, Employee } from "@/lib/types";

type Props = {
  data: CompanyHrAnalytics;
  employees: Employee[];
};

export default function MondaySection({ data, employees }: Props) {
  const labels = employees.map((e) => shortName(e));

  const byUser = useMemo(
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
          label: "Hired",
          data: employees.map((e) => e.metrics?.hires ?? 0),
          backgroundColor: hrChartColors.hired,
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

  const statusPie = useMemo(
    () => ({
      labels: ["Leads", "Follow-up", "Hired", "Loaded", "Rejected"],
      datasets: [
        {
          data: [
            data.leads ?? 0,
            data.follow_up ?? 0,
            data.hires ?? 0,
            data.loaded ?? 0,
            data.rejected ?? 0,
          ],
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
    }),
    [data],
  );

  const conversion = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: employees.map((e) => e.metrics?.leads ?? 0),
          backgroundColor: hrChartColors.leads,
        },
        {
          label: "Loaded",
          data: employees.map((e) => e.metrics?.loaded ?? 0),
          backgroundColor: hrChartColors.loaded,
        },
      ],
    }),
    [employees, labels],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="m-leads"
          label="Leads"
          value={String(data.leads ?? 0)}
          change="New leads boards"
        />
        <StatCardDefault
          id="m-fu"
          label="Follow-up"
          value={String(data.follow_up ?? 0)}
        />
        <StatCardDefault
          id="m-hired"
          label="Hired"
          value={String(data.hires ?? 0)}
          change="Just hired"
        />
        <StatCardDefault
          id="m-loaded"
          label="Loaded"
          value={String(data.loaded ?? 0)}
          change="First load"
        />
        <StatCardDefault
          id="m-rej"
          label="Rejected"
          value={String(data.rejected ?? 0)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Pipeline by status"
          description="Company Monday.com totals"
        >
          <Doughnut data={statusPie} options={doughnutOptions()} />
        </ChartPanel>
        <ChartPanel
          title="Leads vs loaded by user"
          description="Volume vs real hire signal"
        >
          <Bar data={conversion} options={barOptions(false)} />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Monday metrics by user"
        description="Full pipeline breakdown per person"
      >
        <Bar data={byUser} options={barOptions(false)} />
      </ChartPanel>
    </div>
  );
}
