"use client";

import "@/components/Analytics/chartSetup";

import type { ReactNode } from "react";
import type { ChartOptions } from "chart.js";
import { hrChartColors } from "@/components/HrCompanyDashboard/SectionNav";

export function ChartPanel({
  title,
  description,
  children,
  className,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section className={`border border-border bg-surface p-5 ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium tracking-wide text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="h-72">{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}

function basePlugins() {
  return {
    legend: {
      labels: {
        color: hrChartColors.muted,
        boxWidth: 10,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "#111111",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: hrChartColors.foreground,
      bodyColor: hrChartColors.muted,
    },
  };
}

export function barOptions(stacked = false): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      ...basePlugins(),
      tooltip: {
        ...basePlugins().tooltip,
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked,
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
      },
      y: {
        stacked,
        beginAtZero: true,
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
      },
    },
  };
}

export function lineOptions(options?: {
  integerY?: boolean;
}): ChartOptions<"line"> {
  const integerY = options?.integerY ?? false;

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: basePlugins(),
    scales: {
      x: {
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: hrChartColors.muted,
          ...(integerY
            ? {
                stepSize: 1,
                precision: 0,
                callback: (value) =>
                  Number.isInteger(Number(value)) ? String(value) : "",
              }
            : {}),
        },
        grid: { color: hrChartColors.grid },
      },
    },
  };
}

/** Draw call counts on each point so numbers are visible without hovering. */
export const pointValueLabelsPlugin = {
  id: "pointValueLabels",
  afterDatasetsDraw(chart: {
    ctx: CanvasRenderingContext2D;
    data: { datasets: Array<{ data: unknown[] }> };
    getDatasetMeta: (index: number) => {
      data: Array<{ x: number; y: number }>;
      hidden?: boolean;
    };
  }) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;
      meta.data.forEach((point, index) => {
        const raw = dataset.data[index];
        const value = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(value)) return;
        ctx.save();
        ctx.fillStyle = hrChartColors.foreground;
        ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(value), point.x, point.y - 8);
        ctx.restore();
      });
    });
  },
};

export function doughnutOptions(): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: hrChartColors.muted,
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: basePlugins().tooltip,
    },
  };
}
