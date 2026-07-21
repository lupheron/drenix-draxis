"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard, { SummaryPill } from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { cphLeads, mean } from "@/components/Analytics/leadsMetrics";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

export default function CostPerHireChart({ data }: { data: LeadsDataRow[] }) {
  const values = useMemo(() => data.map((row) => cphLeads(row)), [data]);
  const nonZero = values.filter((value) => value > 0);

  const chartData = useMemo(
    () => ({
      labels: data.map((row) => row.month),
      datasets: [
        {
          label: "CPH (leads only)",
          data: values,
          borderColor: chartColors.spend,
          backgroundColor: "rgba(249,115,22,0.18)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [data, values],
  );

  const best = nonZero.length
    ? Math.min(...nonZero)
    : 0;
  const worst = nonZero.length ? Math.max(...nonZero) : 0;

  return (
    <ChartCard
      title="Cost per hire — leads only"
      footer={
        <>
          <SummaryPill
            label="average CPH"
            value={`$${Math.round(mean(nonZero)).toLocaleString()}`}
          />
          <SummaryPill label="best month" value={`$${best.toLocaleString()}`} />
          <SummaryPill label="worst month" value={`$${worst.toLocaleString()}`} />
        </>
      }
    >
      <Line data={chartData} options={baseChartOptions} />
    </ChartCard>
  );
}
