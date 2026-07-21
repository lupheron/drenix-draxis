"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard, { SummaryPill } from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { mean } from "@/components/Analytics/leadsMetrics";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

const MAX = 2000;
const NORMAL = 1500;
const MIN = 1000;

export default function SpendingBandsChart({ data }: { data: LeadsDataRow[] }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((row) => row.month),
      datasets: [
        {
          label: "Max",
          data: data.map(() => MAX),
          borderColor: chartColors.high,
          borderDash: [6, 4],
          pointRadius: 0,
        },
        {
          label: "Normal",
          data: data.map(() => NORMAL),
          borderColor: chartColors.normal,
          borderDash: [6, 4],
          pointRadius: 0,
        },
        {
          label: "Min",
          data: data.map(() => MIN),
          borderColor: chartColors.low,
          borderDash: [6, 4],
          pointRadius: 0,
        },
        {
          label: "Ad spend",
          data: data.map((row) => row.ad_spend_usd),
          borderColor: chartColors.spend,
          backgroundColor: "rgba(249,115,22,0.12)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [data],
  );

  const spend = data.map((row) => row.ad_spend_usd);

  return (
    <ChartCard
      title="Monthly ad spend vs bands"
      footer={
        <>
          <SummaryPill
            label="avg spend"
            value={`$${Math.round(mean(spend)).toLocaleString()}`}
          />
          <SummaryPill
            label="above normal"
            value={String(spend.filter((value) => value > NORMAL).length)}
          />
          <SummaryPill
            label="below min"
            value={String(spend.filter((value) => value < MIN).length)}
          />
          <SummaryPill
            label="over max"
            value={String(spend.filter((value) => value > MAX).length)}
          />
        </>
      }
    >
      <Line
        data={chartData}
        options={{
          ...baseChartOptions,
          scales: {
            ...baseChartOptions.scales,
            y: {
              ...baseChartOptions.scales.y,
              ticks: {
                ...baseChartOptions.scales.y.ticks,
                callback: (value) => `$${value}`,
              },
            },
          },
        }}
      />
    </ChartCard>
  );
}
