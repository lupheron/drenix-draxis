"use client";

import { useEffect, useRef, useState } from "react";
import type { LeadsDataRow } from "@/types/leads";
import { buildForecast, type ForecastRow } from "@/components/LeadsDashboard/forecast";
import { CardTitle } from "@/components/LeadsDashboard/ui";
import { useLeadsTheme } from "@/components/LeadsDashboard/theme";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { cn } from "@/utils/cn";

const FORECAST_METRICS = [
  {
    key: "leads",
    label: "Total leads",
    accentClass: "text-sky-400",
    accentStandalone: "#185FA5",
    trendKey: "_leads" as const,
    explainKey: "leads",
    trendUnit: "",
    trendThreshold: 0.5,
  },
  {
    key: "hiredLeads",
    label: "Hired — Leads",
    accentClass: "text-emerald-400",
    accentStandalone: "#1D9E75",
    explainKey: "hiredLeads",
  },
  {
    key: "hiredLB",
    label: "Hired — Lead Base",
    accentClass: "text-sky-400",
    accentStandalone: "#185FA5",
    explainKey: "hiredLB",
  },
  {
    key: "hiredRef",
    label: "Hired — Referral",
    accentClass: "text-amber-400",
    accentStandalone: "#BA7517",
    explainKey: "hiredRef",
  },
  {
    key: "totalHired",
    label: "Total hired",
    accentClass: "text-emerald-300",
    accentStandalone: "#085041",
    explainKey: "totalHired",
    divider: true,
  },
  {
    key: "leadsRate",
    label: "Hire rate (leads only)",
    accentClass: "text-sky-400",
    accentStandalone: "#185FA5",
    trendKey: "_leadsRate" as const,
    explainKey: "leadsRate",
    trendUnit: "%",
    trendThreshold: 0.5,
  },
  {
    key: "lbRate",
    label: "Hire rate (Lead Base only)",
    accentClass: "text-sky-400",
    accentStandalone: "#185FA5",
    trendKey: "_lbRate" as const,
    explainKey: "lbRate",
    trendUnit: "%",
    trendThreshold: 0.5,
  },
  {
    key: "overallRate",
    label: "Overall hire rate",
    accentClass: "text-violet-400",
    accentStandalone: "#534AB7",
    trendKey: "_overallRate" as const,
    explainKey: "overallRate",
    trendUnit: "%",
    trendThreshold: 0.5,
  },
  {
    key: "adSpend",
    label: "Ad spend",
    accentClass: "text-amber-400",
    accentStandalone: "#BA7517",
    trendKey: "_adSpend" as const,
    explainKey: "adSpend",
    trendUnit: "$",
    trendThreshold: 50,
    trendInvert: true,
    divider: true,
  },
  {
    key: "cphLeads",
    label: "CPH (leads only)",
    accentClass: "text-red-400",
    accentStandalone: "#E24B4A",
    trendKey: "_cphLeads" as const,
    explainKey: "cphLeads",
    trendUnit: "$",
    trendThreshold: 10,
    trendInvert: true,
  },
  {
    key: "cphLB",
    label: "CPH (Lead Base only)",
    accentClass: "text-sky-400",
    accentStandalone: "#185FA5",
    trendKey: "_cphLB" as const,
    explainKey: "cphLB",
    trendUnit: "$",
    trendThreshold: 10,
    trendInvert: true,
  },
] as const;

function TrendBadge({
  delta,
  unit,
  invert,
  threshold = 0.5,
  dark,
}: {
  delta: number;
  unit: string;
  invert?: boolean;
  threshold?: number;
  dark?: boolean;
}) {
  const abs = Math.abs(delta);
  if (abs < threshold) {
    return (
      <span className={cn("text-[10px] font-semibold", dark ? "text-muted" : undefined)}
        style={dark ? undefined : { fontSize: 10, color: "#9ca3af", fontWeight: 600 }}
      >
        Stable
      </span>
    );
  }

  const positive = invert ? delta < 0 : delta > 0;
  const arrow = delta > 0 ? "↑" : "↓";
  const formatted =
    unit === "$"
      ? `$${Math.round(abs).toLocaleString()}`
      : `${abs.toFixed(1)}${unit}`;

  return (
    <span
      className={cn(
        "text-[10px] font-bold",
        positive ? "text-emerald-400" : "text-red-400",
      )}
    >
      {arrow} {formatted}
    </span>
  );
}

export default function ForecastCard({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();
  const isDark = theme === "draxis";
  const forecast = buildForecast(data);
  const [activeIndex, setActiveIndex] = useState(0);
  const [insights, setInsights] = useState<
    Array<Record<string, string> | null>
  >([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef([false, false, false]);

  const active = forecast[activeIndex];
  const last = data[data.length - 1];

  useEffect(() => {
    if (!active || fetched.current[activeIndex]) return;
    fetched.current[activeIndex] = true;
    setLoading(true);
    setError(null);

    fetch("/api/forecast-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: data.slice(-4).map((row) => ({
          month: row.month,
          leads: row.leads,
          hired_by_leads: row.hired_by_leads,
          hired_by_leadbase: row.hired_by_leadbase,
          hired_by_referral: row.hired_by_referral,
          hired: row.hired,
          ad_spend_usd: row.ad_spend_usd,
          hire_rate_pct: row.hire_rate_pct,
        })),
        forecast: {
          month: active.month,
          leads: active.leads,
          hiredLeads: active.hiredLeads,
          hiredLB: active.hiredLB,
          hiredRef: active.hiredRef,
          totalHired: active.totalHired,
          leadsRate: active.leadsRate,
          lbRate: active.lbRate,
          overallRate: active.overallRate,
          adSpend: active.adSpend,
          cphLeads: active.cphLeads,
          cphLB: active.cphLB,
        },
      }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.error && !payload.leads) {
          setError(String(payload.error));
          return;
        }
        setInsights((current) => {
          const next = [...current];
          next[activeIndex] = payload as Record<string, string>;
          return next;
        });
      })
      .catch((fetchError) => setError(String(fetchError)))
      .finally(() => setLoading(false));
  }, [active, activeIndex, data]);

  if (forecast.length === 0 || !last || !active) return null;

  const baseline = {
    _leads: last.leads,
    _adSpend: last.ad_spend_usd,
    _leadsRate: last.leads > 0 ? (last.hired_by_leads / last.leads) * 100 : 0,
    _lbRate:
      last.leads > 0 ? (last.hired_by_leadbase / last.leads) * 100 : 0,
    _overallRate: last.hire_rate_pct,
    _cphLeads:
      last.hired_by_leads > 0 ? last.ad_spend_usd / last.hired_by_leads : 0,
    _cphLB:
      last.hired_by_leadbase > 0
        ? last.ad_spend_usd / last.hired_by_leadbase
        : 0,
  };

  const thClass = cn(
    "sticky top-0 border-b px-3 py-2 text-[11px] font-semibold",
    isDark
      ? "border-border bg-surface-elevated text-muted-foreground"
      : "border-[#e5e7eb] bg-[#f8fdf9] text-[#6b7280]",
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <CardTitle
          title="3-month forecast"
          subtitle={`Weighted trend · last ${Math.min(data.length, 4)} months`}
        />
        <div className="flex items-center gap-2">
          {loading ? (
            <EyeLoadingDefault
              inline
              size="sm"
              label="AI thinking…"
              className="text-muted"
            />
          ) : null}
          {forecast.map((row, index) => (
            <button
              key={row.month}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
                activeIndex === index
                  ? isDark
                    ? "border-warning/40 bg-warning/15 text-warning"
                    : "border-[#085041] bg-[#085041] text-white"
                  : isDark
                    ? "border-border text-muted-foreground hover:border-border-strong"
                    : "border-[#c2e8d6] bg-white text-[#085041]",
              )}
            >
              {row.month}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="text-xs text-warning">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={cn(thClass, "text-left")}>Metric</th>
              <th
                className={cn(
                  thClass,
                  "text-center",
                  isDark ? "text-foreground" : "text-[#085041]",
                )}
              >
                {active.month}{" "}
                <span className="font-normal text-muted">est.</span>
              </th>
              <th className={cn(thClass, "text-center")}>Trend</th>
              <th className={cn(thClass, "text-left")}>
                AI insight{" "}
                <span className="rounded bg-emerald-800 px-1 py-0.5 text-[9px] font-bold text-white">
                  GPT
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FORECAST_METRICS.map((metric, index) => {
              const value = String(
                active[metric.key as keyof ForecastRow] ?? "—",
              );
              const trendKey =
                "trendKey" in metric ? metric.trendKey : undefined;
              const delta =
                trendKey !== undefined
                  ? active[trendKey] - baseline[trendKey]
                  : null;
              const insight = insights[activeIndex]?.[metric.explainKey] ?? "—";

              return (
                <tr
                  key={metric.key}
                  className={cn(
                    index % 2 === 1 && isDark && "bg-accent-dim/20",
                    "divider" in metric &&
                      metric.divider &&
                      "border-t border-border",
                  )}
                  style={
                    !isDark
                      ? {
                          background:
                            index % 2 === 0 ? "#fff" : "rgba(29,158,117,0.03)",
                          borderTop:
                            "divider" in metric && metric.divider
                              ? "1.5px solid #e5e7eb"
                              : undefined,
                        }
                      : undefined
                  }
                >
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-muted-foreground">
                    {metric.label}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-center text-sm font-bold",
                      isDark ? metric.accentClass : undefined,
                    )}
                    style={
                      !isDark ? { color: metric.accentStandalone } : undefined
                    }
                  >
                    {value}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {delta !== null ? (
                      <TrendBadge
                        delta={delta}
                        unit={"trendUnit" in metric ? metric.trendUnit : ""}
                        invert={
                          "trendInvert" in metric ? metric.trendInvert : false
                        }
                        threshold={
                          "trendThreshold" in metric
                            ? metric.trendThreshold
                            : 0.5
                        }
                        dark={isDark}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                    {insight}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
