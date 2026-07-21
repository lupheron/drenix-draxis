"use client";

import { createContext, useContext } from "react";

export type LeadsDashboardTheme = "draxis" | "standalone";

export const LeadsThemeContext = createContext<LeadsDashboardTheme>("standalone");

export function useLeadsTheme() {
  return useContext(LeadsThemeContext);
}

export const themeTokens = {
  draxis: {
    title: "#f0f0f0",
    subtitle: "#a3a3a3",
    muted: "#737373",
    body: "#d4d4d4",
    card: "border border-border bg-surface",
    pill: "border border-border bg-accent-dim/40",
    pillValue: "text-foreground",
    pillLabel: "text-muted-foreground",
    badge: "border border-warning/30 bg-warning/10 text-warning",
    error:
      "border border-danger/30 bg-danger/10 text-danger rounded-sm px-4 py-3 text-sm",
    heroGreen: "bg-gradient-to-br from-emerald-900/80 to-emerald-700/40 border border-emerald-500/20",
    heroBlue: "bg-gradient-to-br from-sky-900/70 to-violet-900/40 border border-sky-500/20",
    statTile: "border border-border bg-accent-dim/30",
    tableHeader: "bg-surface-elevated text-muted-foreground",
    tableRowAlt: "bg-accent-dim/20",
    tableBorder: "border-border",
    accent: "#22c55e",
    accentBlue: "#60a5fa",
    accentPurple: "#a78bfa",
    accentAmber: "#f59e0b",
    accentRed: "#ef4444",
    legend: "#a3a3a3",
    monthBtnActive: "border-warning/40 bg-warning/15 text-warning",
    monthBtn: "border border-border text-muted-foreground hover:border-border-strong",
    forecastTabActive: "border-warning/40 bg-warning/15 text-warning",
    forecastTab: "border border-border text-muted-foreground",
  },
  standalone: {
    title: "#1a1a1a",
    subtitle: "#6b7280",
    muted: "#9ca3af",
    body: "#374151",
    card: "ld-card",
    pill: "ld-pill",
    pillValue: "ld-pill-value",
    pillLabel: "ld-pill-label",
    badge:
      "text-[10px] font-semibold text-[#BA7517] bg-[rgba(186,117,23,0.1)] border border-[rgba(186,117,23,0.25)] rounded px-1.5 py-0.5",
    error: "",
    heroGreen: "",
    heroBlue: "",
    statTile: "",
    tableHeader: "",
    tableRowAlt: "",
    tableBorder: "",
    accent: "#085041",
    accentBlue: "#185FA5",
    accentPurple: "#534AB7",
    accentAmber: "#BA7517",
    accentRed: "#E24B4A",
    legend: "#374151",
    monthBtnActive: "",
    monthBtn: "",
    forecastTabActive: "",
    forecastTab: "",
  },
} as const;
