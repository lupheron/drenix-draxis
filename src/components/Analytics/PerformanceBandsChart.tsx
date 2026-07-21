"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard, { SummaryPill } from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { mean, round } from "@/components/Analytics/leadsMetrics";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

const HIGH = 400;
const NORMAL = 300;
const LOW = 200;

export default function PerformanceBandsChart({
  data,
}: {
  data: LeadsDataRow[];
}) {
  const chartData = useMemo(
    () => ({
      labels: data.map((row) => row.month),
      datasets: [
        {
          label: "High",
          data: data.map(() => HIGH),
          borderColor: chartColors.high,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0,
        },
        {
          label: "Normal",
          data: data.map(() => NORMAL),
          borderColor: chartColors.normal,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0,
        },
        {
          label: "Low",
          data: data.map(() => LOW),
          borderColor: chartColors.low,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0,
        },
        {
          label: "Leads",
          data: data.map((row) => row.leads),
          borderColor: chartColors.leads,
          backgroundColor: "rgba(96,165,250,0.15)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [data],
  );

  const leads = data.map((row) => row.leads);
  const avgSpend = mean(data.map((row) => row.ad_spend_usd));

  return (
    <ChartCard
      title="Lead volume vs performance bands"
      description="Monthly leads against fixed targets"
      footer={
        <>
          <SummaryPill
            label="avg monthly leads"
            value={String(Math.round(mean(leads)))}
          />
          <SummaryPill
            label="months above normal"
            value={String(data.filter((row) => row.leads > NORMAL).length)}
          />
          <SummaryPill
            label="months below low"
            value={String(data.filter((row) => row.leads < LOW).length)}
          />
          <SummaryPill
            label="budget corrections"
            value={String(
              data.filter((row) => row.ad_spend_usd > avgSpend * 1.1).length,
            )}
          />
        </>
      }
    >
      <Line
        data={chartData}
        options={{
          ...baseChartOptions,
          plugins: { ...baseChartOptions.plugins, legend: { display: true } },
        }}
      />
    </ChartCard>
  );
}
