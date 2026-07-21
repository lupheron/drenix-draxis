"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import ChartCard, { SummaryPill } from "@/components/Analytics/ChartCard";
import { baseChartOptions, chartColors } from "@/components/Analytics/chartTheme";
import { mean } from "@/components/Analytics/leadsMetrics";
import { registerCharts } from "@/components/Analytics/chartSetup";

registerCharts();

const MAX = 15;
const MARKET = 7;
const NORMAL = 6;
const MIN = 4;

export default function HireRateBandsChart({ data }: { data: LeadsDataRow[] }) {
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
          label: "Market avg",
          data: data.map(() => MARKET),
          borderColor: chartColors.market,
          borderDash: [4, 4],
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
          label: "Overall rate",
          data: data.map((row) => row.hire_rate_pct),
          borderColor: chartColors.rate,
          backgroundColor: "rgba(34,197,94,0.12)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [data],
  );

  const rates = data.map((row) => row.hire_rate_pct);

  return (
    <ChartCard
      title="Hire rate bands — all sources"
      footer={
        <>
          <SummaryPill
            label="avg overall hire rate"
            value={`${mean(rates).toFixed(1)}%`}
          />
          <SummaryPill
            label="above market max"
            value={String(rates.filter((rate) => rate >= MARKET).length)}
          />
          <SummaryPill
            label="at normal"
            value={String(
              rates.filter((rate) => rate >= NORMAL && rate < MARKET).length,
            )}
          />
          <SummaryPill
            label="below min"
            value={String(rates.filter((rate) => rate < MIN).length)}
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
                callback: (value) => `${value}%`,
              },
            },
          },
        }}
      />
    </ChartCard>
  );
}
