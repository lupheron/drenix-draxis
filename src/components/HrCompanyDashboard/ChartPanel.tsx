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
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
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
    plugins: basePlugins(),
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

export function lineOptions(): ChartOptions<"line"> {
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
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
      },
    },
  };
}

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
