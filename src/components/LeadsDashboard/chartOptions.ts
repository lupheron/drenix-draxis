import type { ChartOptions } from "chart.js";
import type { LeadsDashboardTheme } from "@/components/LeadsDashboard/theme";

const fontFamily = "var(--font-geist-sans), system-ui, sans-serif";

export const axisFont = { size: 10, family: fontFamily };

const light = {
  legend: "#374151",
  tick: "#6b7280",
  gridX: { color: "rgba(8, 80, 65, 0.08)", lineWidth: 1 },
  gridY: { color: "rgba(8, 80, 65, 0.13)", lineWidth: 1 },
  tooltipBg: "#fff",
  tooltipBorder: "#e5e7eb",
  tooltipTitle: "#1a1a1a",
  tooltipBody: "#6b7280",
};

const dark = {
  legend: "#a3a3a3",
  tick: "#737373",
  gridX: { color: "rgba(255,255,255,0.06)", lineWidth: 1 },
  gridY: { color: "rgba(255,255,255,0.08)", lineWidth: 1 },
  tooltipBg: "#111111",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipTitle: "#f0f0f0",
  tooltipBody: "#a3a3a3",
};

export function lineChartOptions(
  theme: LeadsDashboardTheme = "standalone",
  overrides?: Partial<ChartOptions<"line">>,
): ChartOptions<"line"> {
  const palette = theme === "draxis" ? dark : light;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          font: axisFont,
          boxWidth: 12,
          usePointStyle: true,
          color: palette.legend,
        },
      },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        borderColor: palette.tooltipBorder,
        borderWidth: 1,
        titleColor: palette.tooltipTitle,
        bodyColor: palette.tooltipBody,
        titleFont: axisFont,
        bodyFont: axisFont,
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 45, font: axisFont, color: palette.tick },
        grid: palette.gridX,
      },
      y: {
        ticks: { font: axisFont, color: palette.tick },
        grid: palette.gridY,
      },
    },
    ...overrides,
  };
}

export function comboChartOptions(
  theme: LeadsDashboardTheme = "standalone",
  overrides?: Partial<ChartOptions<"bar">>,
): ChartOptions<"bar"> {
  return lineChartOptions(theme, overrides as Partial<ChartOptions<"line">>) as ChartOptions<"bar">;
}
