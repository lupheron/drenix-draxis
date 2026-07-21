"use client";

import { useMemo } from "react";
import { Chart } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

export default function LeadsHireRateChart({ data }: { data: LeadsDataRow[] }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((row) => row.month),
      datasets: [
        {
          type: "bar" as const,
          label: "Leads",
          data: data.map((row) => row.leads),
          backgroundColor: "rgba(96,165,250,0.55)",
          borderColor: chartColors.leads,
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "Hire rate %",
          data: data.map((row) => row.hire_rate_pct),
          borderColor: chartColors.rate,
          backgroundColor: chartColors.rate,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    }),
    [data],
  );

  return (
    <ChartCard
      title="Leads & hire rate per month"
      description="Bars = lead volume · line = overall hire rate"
    >
      <Chart
        type="bar"
        data={chartData}
        options={{
          ...baseChartOptions,
          scales: {
            x: baseChartOptions.scales.x,
            y: {
              ...baseChartOptions.scales.y,
              position: "left",
              title: { display: true, text: "Leads", color: chartColors.muted },
            },
            y1: {
              ...baseChartOptions.scales.y,
              position: "right",
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: "Hire rate %",
                color: chartColors.muted,
              },
              ticks: {
                ...baseChartOptions.scales.y.ticks,
                callback: (value) => `${value}%`,
              },
            },
          },
        }}
      />
    </ChartCard>
  );
}
