export const chartColors = {
  foreground: "#f0f0f0",
  muted: "#737373",
  grid: "rgba(255,255,255,0.06)",
  leads: "#60a5fa",
  hired: "#34d399",
  leadsStream: "#38bdf8",
  leadBase: "#a78bfa",
  referral: "#fbbf24",
  spend: "#f97316",
  rate: "#22c55e",
  high: "#ef4444",
  normal: "#f59e0b",
  low: "#64748b",
  market: "#94a3b8",
};

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartColors.muted,
        boxWidth: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "#111111",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: chartColors.foreground,
      bodyColor: chartColors.muted,
    },
  },
  scales: {
    x: {
      ticks: { color: chartColors.muted },
      grid: { color: chartColors.grid },
    },
    y: {
      ticks: { color: chartColors.muted },
      grid: { color: chartColors.grid },
    },
  },
};
