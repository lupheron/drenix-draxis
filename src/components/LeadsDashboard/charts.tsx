"use client";

import { useMemo } from "react";
import { Chart, Line } from "react-chartjs-2";
import type { LeadsDataRow } from "@/types/leads";
import {
  COLORS,
  MARKETING_SOURCES,
  STATIC_MARKETING_DATA,
} from "@/components/LeadsDashboard/constants";
import { comboChartOptions, lineChartOptions } from "@/components/LeadsDashboard/chartOptions";
import { ChartFrame, LegendBar, LegendDot } from "@/components/LeadsDashboard/ui";
import { useLeadsTheme } from "@/components/LeadsDashboard/theme";
import "@/components/LeadsDashboard/chartSetup";

function dashedLine(label: string, data: number[], color: string) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderDash: [6, 3] as number[],
    pointRadius: 0,
    tension: 0,
  };
}

function solidLine(label: string, data: number[], color: string) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: "transparent",
    borderWidth: 2.5,
    pointRadius: 4,
    pointBackgroundColor: color,
    pointBorderColor: "#fff",
    pointBorderWidth: 1.5,
    tension: 0.25,
  };
}

export function PerformanceBandsChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const labels = data.map((row) => row.month);
  const summary = useMemo(() => {
    const avgLeads = Math.round(
      data.reduce((sum, row) => sum + row.leads, 0) / Math.max(data.length, 1),
    );
    const avgSpend =
      data.reduce((sum, row) => sum + row.ad_spend_usd, 0) /
      Math.max(data.length, 1);
    return {
      avgLeads,
      aboveNormal: data.filter((row) => row.leads > 300).length,
      belowLow: data.filter((row) => row.leads < 200).length,
      budgetCorrections: data.filter((row) => row.ad_spend_usd > avgSpend * 1.1)
        .length,
    };
  }, [data]);

  const chartData = {
    labels,
    datasets: [
      dashedLine("High", data.map(() => 400), COLORS.greenDark),
      dashedLine("Normal", data.map(() => 300), COLORS.green),
      dashedLine("Low", data.map(() => 200), COLORS.red),
      solidLine(
        "Current",
        data.map((row) => row.leads),
        COLORS.blue,
      ),
    ],
  };

  return (
    <ChartFrame
      title="Performance bands — monthly leads"
      subtitle="Lead volume vs High / Normal / Low targets"
      legend={
        <>
          <LegendDot color={COLORS.greenDark} label="High (400)" dash />
          <LegendDot color={COLORS.green} label="Normal (300)" dash />
          <LegendDot color={COLORS.red} label="Low (200)" dash />
          <LegendDot color={COLORS.blue} label="Current" />
        </>
      }
      pills={[
        { label: "Avg monthly leads", value: String(summary.avgLeads) },
        { label: "Months above normal", value: String(summary.aboveNormal) },
        { label: "Months below low", value: String(summary.belowLow) },
        {
          label: "Budget corrections",
          value: String(summary.budgetCorrections),
        },
      ]}
    >
      <Line data={chartData} options={lineChartOptions(theme)} />
    </ChartFrame>
  );
}

export function HireRateBandsChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const labels = data.map((row) => row.month);
  const rates = data.map((row) => row.hire_rate_pct);
  const avg = (rates.reduce((sum, rate) => sum + rate, 0) / Math.max(rates.length, 1)).toFixed(1);

  const chartData = {
    labels,
    datasets: [
      dashedLine("Max", data.map(() => 15), COLORS.greenDark),
      dashedLine("Market avg max", data.map(() => 7), "#9ca3af"),
      dashedLine("Normal", data.map(() => 6), COLORS.green),
      dashedLine("Min", data.map(() => 4), COLORS.red),
      solidLine("All-sources rate", rates, COLORS.purple),
    ],
  };

  return (
    <ChartFrame
      title="Performance bands — hire rate (all sources)"
      pills={[
        { label: "Avg overall hire rate", value: `${avg}%` },
        {
          label: "Months above market max",
          value: String(rates.filter((rate) => rate >= 7).length),
        },
        {
          label: "Months at normal",
          value: String(rates.filter((rate) => rate >= 6 && rate < 7).length),
        },
        {
          label: "Months below min",
          value: String(rates.filter((rate) => rate < 4).length),
        },
      ]}
    >
      <Line
        data={chartData}
        options={lineChartOptions(theme, {
          scales: {
            y: {
              ticks: {
                callback: (value) => `${value}%`,
              },
            },
          },
        })}
      />
    </ChartFrame>
  );
}

export function LeadsHireRateChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      {
        type: "bar" as const,
        label: "Leads",
        data: data.map((row) => row.leads),
        backgroundColor: "rgba(24,95,165,0.55)",
        borderRadius: 3,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Hire rate %",
        data: data.map((row) => row.hire_rate_pct),
        borderColor: COLORS.purple,
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <ChartFrame
      title="Leads & hire rate per month"
      subtitle="Bars = lead volume · line = overall hire rate"
    >
      <Chart
        type="bar"
        data={chartData as never}
        options={comboChartOptions(theme, {
          scales: {
            y: {
              position: "left",
              title: { display: true, text: "Leads", color: "#6b7280" },
            },
            y1: {
              position: "right",
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: "Hire rate %",
                color: "#6b7280",
              },
              ticks: { callback: (value) => `${value}%` },
            },
          },
        })}
      />
    </ChartFrame>
  );
}

export function HireRateLeadsOnlyBandsChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const rates = data.map((row) =>
    row.leads > 0
      ? Math.round((row.hired_by_leads / row.leads) * 1000) / 10
      : 0,
  );

  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      dashedLine("Max", data.map(() => 10), COLORS.greenDark),
      dashedLine("Market avg max", data.map(() => 5), "#9ca3af"),
      dashedLine("Normal", data.map(() => 4), COLORS.green),
      dashedLine("Low", data.map(() => 3), COLORS.red),
      solidLine("Leads-only rate", rates, COLORS.blue),
    ],
  };

  return (
    <ChartFrame title="Performance bands — hire rate (leads only)">
      <Line
        data={chartData}
        options={lineChartOptions(theme, {
          scales: { y: { ticks: { callback: (value) => `${value}%` } } },
        })}
      />
    </ChartFrame>
  );
}

export function LeadBaseBandsChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const rates = data.map((row) =>
    row.leads > 0
      ? Math.round((row.hired_by_leadbase / row.leads) * 1000) / 10
      : 0,
  );

  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      dashedLine("Max", data.map(() => 5), COLORS.greenDark),
      dashedLine("Normal", data.map(() => 2), COLORS.green),
      dashedLine("Low", data.map(() => 1), COLORS.red),
      solidLine("Lead Base rate", rates, COLORS.blue),
    ],
  };

  return (
    <ChartFrame title="Performance bands — hire rate (Lead Base)">
      <Line
        data={chartData}
        options={lineChartOptions(theme, {
          scales: { y: { ticks: { callback: (value) => `${value}%` } } },
        })}
      />
    </ChartFrame>
  );
}

export function SpendingBandsChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const spend = data.map((row) => row.ad_spend_usd);
  const avgSpend = Math.round(
    spend.reduce((sum, value) => sum + value, 0) / Math.max(spend.length, 1),
  );

  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      dashedLine("Max", data.map(() => 2000), COLORS.greenDark),
      dashedLine("Normal", data.map(() => 1500), COLORS.green),
      dashedLine("Min", data.map(() => 1000), COLORS.red),
      solidLine("Current", spend, COLORS.amber),
    ],
  };

  return (
    <ChartFrame
      title="Performance bands — monthly spending"
      pills={[
        { label: "Avg monthly spend", value: `$${avgSpend.toLocaleString()}` },
        {
          label: "Months above normal",
          value: String(spend.filter((value) => value > 1500).length),
        },
        {
          label: "Months below min",
          value: String(spend.filter((value) => value < 1000).length),
        },
        {
          label: "Over max",
          value: String(spend.filter((value) => value > 2000).length),
        },
      ]}
    >
      <Line
        data={chartData}
        options={lineChartOptions(theme, {
          scales: {
            y: {
              ticks: { callback: (value) => `$${value}` },
            },
          },
        })}
      />
    </ChartFrame>
  );
}

export function AdSpendChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      solidLine(
        "Ad spend ($)",
        data.map((row) => row.ad_spend_usd),
        COLORS.amber,
      ),
      {
        label: "Hire rate %",
        data: data.map((row) => row.hire_rate_pct),
        borderColor: COLORS.purple,
        borderWidth: 2.5,
        borderDash: [5, 4],
        pointRadius: 4,
        tension: 0.3,
        yAxisID: "y1",
      },
      dashedLine("Spend Max", data.map(() => 2000), COLORS.greenDark),
      dashedLine("Spend Normal", data.map(() => 1500), COLORS.green),
      dashedLine("Spend Min", data.map(() => 1000), COLORS.red),
    ],
  };

  return (
    <ChartFrame title="Ad spend · hire rate">
      <Chart
        type="line"
        data={chartData}
        options={lineChartOptions(theme, {
          scales: {
            y: {
              position: "left",
              ticks: { callback: (value) => `$${value}` },
            },
            y1: {
              position: "right",
              grid: { drawOnChartArea: false },
              ticks: { callback: (value) => `${value}%` },
            },
          },
        })}
      />
    </ChartFrame>
  );
}

export function CostPerHireChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const values = data.map((row) =>
    row.hired_by_leads > 0
      ? Math.round(row.ad_spend_usd / row.hired_by_leads)
      : 0,
  );
  const nonZero = values.filter((value) => value > 0);
  const avg = nonZero.length
    ? Math.round(nonZero.reduce((sum, value) => sum + value, 0) / nonZero.length)
    : 0;
  const best = nonZero.length ? Math.min(...nonZero) : 0;
  const worst = nonZero.length ? Math.max(...nonZero) : 0;
  const bestMonth =
    nonZero.length > 0
      ? (data[values.indexOf(best)]?.month ?? "—")
      : "—";

  return (
    <ChartFrame
      title="Monthly cost per hire — leads only"
      subtitle="Ad spend ÷ drivers hired via leads each month"
      pills={[
        { label: "Avg cost per hire", value: `$${avg.toLocaleString()}` },
        { label: "Best month", value: bestMonth },
        { label: "Best CPH", value: `$${best.toLocaleString()}` },
        { label: "Worst CPH", value: `$${worst.toLocaleString()}` },
      ]}
    >
      <Line
        data={{
          labels: data.map((row) => row.month),
          datasets: [
            {
              label: "CPH (leads only)",
              data: values,
              borderColor: COLORS.amber,
              backgroundColor: "rgba(186,117,23,0.12)",
              fill: true,
              tension: 0.3,
            },
          ],
        }}
        options={lineChartOptions(theme)}
      />
    </ChartFrame>
  );
}

export function OverallCostPerHireChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const values = data.map((row) =>
    row.hired > 0 ? Math.round(row.ad_spend_usd / row.hired) : 0,
  );
  const nonZero = values.filter((value) => value > 0);
  const avg = nonZero.length
    ? Math.round(nonZero.reduce((sum, value) => sum + value, 0) / nonZero.length)
    : 0;
  const best = nonZero.length ? Math.min(...nonZero) : 0;
  const worst = nonZero.length ? Math.max(...nonZero) : 0;
  const bestMonth =
    nonZero.length > 0
      ? (data[values.indexOf(best)]?.month ?? "—")
      : "—";

  return (
    <ChartFrame
      title="Monthly cost per hire — overall (all sources)"
      subtitle="Ad spend ÷ total drivers hired each month"
      pills={[
        { label: "Avg overall CPH", value: `$${avg.toLocaleString()}` },
        { label: "Best month", value: bestMonth },
        { label: "Best CPH", value: `$${best.toLocaleString()}` },
        { label: "Worst CPH", value: `$${worst.toLocaleString()}` },
      ]}
    >
      <Line
        data={{
          labels: data.map((row) => row.month),
          datasets: [
            {
              label: "CPH (overall)",
              data: values,
              borderColor: COLORS.purple,
              backgroundColor: "rgba(83,74,183,0.12)",
              fill: true,
              tension: 0.3,
            },
          ],
        }}
        options={lineChartOptions(theme)}
      />
    </ChartFrame>
  );
}

export function HiresBySourceChart({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const chartData = {
    labels: data.map((row) => row.month),
    datasets: [
      {
        type: "bar" as const,
        label: "Leads",
        data: data.map((row) => row.hired_by_leads),
        backgroundColor: COLORS.hiresLeads,
        borderRadius: 3,
        stack: "hires",
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Lead Base",
        data: data.map((row) => row.hired_by_leadbase),
        backgroundColor: COLORS.hiresLeadBase,
        borderRadius: 3,
        stack: "hires",
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Referral",
        data: data.map((row) => row.hired_by_referral),
        backgroundColor: COLORS.hiresReferral,
        borderRadius: 3,
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
        borderColor: COLORS.lineLeadsRate,
        borderDash: [5, 4],
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: "y1",
      },
      {
        type: "line" as const,
        label: "Overall hire rate %",
        data: data.map((row) => row.hire_rate_pct),
        borderColor: COLORS.lineOverallRate,
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <ChartFrame
      title="Hires by source — count & hire rate per month"
      legend={
        <>
          <LegendBar color={COLORS.hiresLeads} label="Leads" />
          <LegendBar color={COLORS.hiresLeadBase} label="Lead Base" />
          <LegendBar color={COLORS.hiresReferral} label="Referral" />
          <LegendDot color={COLORS.lineLeadsRate} label="Leads hire rate %" dash />
          <LegendDot color={COLORS.lineOverallRate} label="Overall hire rate %" />
        </>
      }
    >
      <Chart
        type="bar"
        data={chartData as never}
        options={comboChartOptions(theme, {
          scales: {
            x: { stacked: true },
            y: {
              stacked: true,
              position: "left",
              title: { display: true, text: "Hires (count)", color: "#6b7280" },
            },
            y1: {
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Hire rate %", color: "#6b7280" },
              ticks: { callback: (value) => `${Number(value).toFixed(1)}%` },
            },
          },
        })}
      />
    </ChartFrame>
  );
}

export function HireRateBySourceChart() {
  const theme = useLeadsTheme();
  const chartData = {
    labels: STATIC_MARKETING_DATA.map((row) => row.month),
    datasets: MARKETING_SOURCES.map((source) => ({
      type: "bar" as const,
      label: source.label,
      data: STATIC_MARKETING_DATA.map((row) => {
        const channel = row[source.key as keyof typeof row] as {
          leads: number;
          hired: number;
        };
        return channel.leads > 0
          ? Math.round((channel.hired / channel.leads) * 1000) / 10
          : 0;
      }),
      backgroundColor: source.color,
      borderRadius: 3,
      barPercentage: 0.8,
      categoryPercentage: 0.85,
    })),
  };

  return (
    <ChartFrame
      title="Hire rate by source"
      subtitle="% of leads from each source that resulted in a hire — hover for counts"
      badge="Static data"
      legend={MARKETING_SOURCES.map((source) => (
        <LegendBar key={source.key} color={source.color} label={source.label} />
      ))}
    >
      <Chart
        type="bar"
        data={chartData as never}
        options={comboChartOptions(theme, {
          scales: {
            y: {
              ticks: { callback: (value) => `${Number(value).toFixed(1)}%` },
            },
          },
        })}
      />
    </ChartFrame>
  );
}
