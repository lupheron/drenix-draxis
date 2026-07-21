"use client";

import { useMemo } from "react";
import { Chart } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

export default function HiresBySourceChart({ data }: { data: LeadsDataRow[] }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((row) => row.month),
      datasets: [
        {
          type: "bar" as const,
          label: "Leads hires",
          data: data.map((row) => row.hired_by_leads),
          backgroundColor: "rgba(56,189,248,0.7)",
          stack: "hires",
          yAxisID: "y",
        },
        {
          type: "bar" as const,
          label: "Lead Base hires",
          data: data.map((row) => row.hired_by_leadbase),
          backgroundColor: "rgba(167,139,250,0.7)",
          stack: "hires",
          yAxisID: "y",
        },
        {
          type: "bar" as const,
          label: "Referral hires",
          data: data.map((row) => row.hired_by_referral),
          backgroundColor: "rgba(251,191,36,0.7)",
          stack: "hires",
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "Leads hire rate %",
          data: data.map((row) =>
            row.leads > 0
              ? Math.round((row.hired_by_leads / row.leads) * 1000) / 10
              : 0,
          ),
          borderColor: chartColors.leadsStream,
          yAxisID: "y1",
          tension: 0.3,
        },
        {
          type: "line" as const,
          label: "Overall hire rate %",
          data: data.map((row) => row.hire_rate_pct),
          borderColor: chartColors.rate,
          yAxisID: "y1",
          tension: 0.3,
        },
      ],
    }),
    [data],
  );

  return (
    <ChartCard
      title="Hires by source"
      description="Stacked hire counts with hire-rate lines"
    >
      <Chart
        type="bar"
        data={chartData}
        options={{
          ...baseChartOptions,
          scales: {
            x: { ...baseChartOptions.scales.x, stacked: true },
            y: {
              ...baseChartOptions.scales.y,
              stacked: true,
              position: "left",
            },
            y1: {
              ...baseChartOptions.scales.y,
              position: "right",
              grid: { drawOnChartArea: false },
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
