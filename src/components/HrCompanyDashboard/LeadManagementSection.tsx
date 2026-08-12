"use client";

import "@/components/Analytics/chartSetup";

import { useEffect, useMemo, useState } from "react";
import { Bar, Chart, Doughnut, Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import {
  ChartPanel,
  barOptions,
  doughnutOptions,
  lineOptions,
} from "@/components/HrCompanyDashboard/ChartPanel";
import { hrChartColors } from "@/components/HrCompanyDashboard/SectionNav";
import {
  cphLeads,
  cphOverall,
  leadBaseRate,
  leadsOnlyRate,
  periodSummary,
} from "@/components/Analytics/leadsMetrics";
import { buildForecast } from "@/components/LeadsDashboard/forecast";
import type { LeadsDataRow } from "@/types/leads";
import { cn } from "@/utils/cn";

type LeadView = "overview" | "performance" | "sources" | "cost" | "forecast";

const VIEWS: { id: LeadView; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "KPIs & summary" },
  { id: "performance", label: "Performance", hint: "Leads & rates" },
  { id: "sources", label: "Sources", hint: "Hire channels" },
  { id: "cost", label: "Cost", hint: "Spend & CPH" },
  { id: "forecast", label: "Forecast", hint: "3-month outlook" },
];

const leadColors = {
  leads: hrChartColors.leads,
  hired: hrChartColors.hired,
  leadbase: hrChartColors.inbound,
  referral: hrChartColors.followUp,
  spend: hrChartColors.calls,
  overall: "#c084fc",
};

function money(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function dualLineOptions(): ChartOptions<"line"> {
  return {
    ...lineOptions(),
    scales: {
      x: {
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
      },
      y: {
        beginAtZero: true,
        position: "left",
        ticks: { color: hrChartColors.muted },
        grid: { color: hrChartColors.grid },
        title: {
          display: true,
          text: "Leads",
          color: hrChartColors.muted,
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        ticks: {
          color: hrChartColors.muted,
          callback: (value) => `${value}%`,
        },
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "Hire rate",
          color: hrChartColors.muted,
        },
      },
    },
  };
}

export default function LeadManagementSection() {
  const [data, setData] = useState<LeadsDataRow[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<LeadView>("overview");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/leads");
        if (!response.ok) {
          throw new Error(`Failed to load leads (${response.status})`);
        }
        const payload = (await response.json()) as {
          data: LeadsDataRow[];
          error?: string;
        };
        if (!cancelled) {
          setData(payload.data ?? []);
          setError(payload.error);
        }
      } catch (err) {
        if (!cancelled) {
          setData([]);
          setError(err instanceof Error ? err.message : "Failed to load leads");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = data ?? [];
  const summary = useMemo(() => periodSummary(rows), [rows]);
  const forecast = useMemo(() => buildForecast(rows), [rows]);
  const labels = useMemo(() => rows.map((row) => row.month), [rows]);
  const rangeLabel =
    rows.length > 0
      ? `${rows[0].month} – ${rows[rows.length - 1].month}`
      : "No months";

  const leadsByMonth = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: rows.map((row) => row.leads),
          backgroundColor: leadColors.leads,
        },
        {
          label: "Hired",
          data: rows.map((row) => row.hired),
          backgroundColor: leadColors.hired,
        },
      ],
    }),
    [labels, rows],
  );

  const performanceBands = useMemo(
    () => ({
      labels,
      datasets: [
        {
          type: "line" as const,
          label: "High band",
          data: rows.map((row) => row.high_band),
          borderColor: "rgba(52, 211, 153, 0.7)",
          backgroundColor: "transparent",
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          type: "line" as const,
          label: "Normal band",
          data: rows.map((row) => row.normal_band),
          borderColor: "rgba(96, 165, 250, 0.7)",
          backgroundColor: "transparent",
          borderDash: [4, 4],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          type: "line" as const,
          label: "Low band",
          data: rows.map((row) => row.low_band),
          borderColor: "rgba(244, 63, 94, 0.7)",
          backgroundColor: "transparent",
          borderDash: [2, 4],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          type: "bar" as const,
          label: "Leads",
          data: rows.map((row) => row.leads),
          backgroundColor: leadColors.leads,
        },
      ],
    }),
    [labels, rows],
  );

  const hireRateTrend = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: rows.map((row) => row.leads),
          borderColor: leadColors.leads,
          backgroundColor: "rgba(96, 165, 250, 0.12)",
          fill: true,
          yAxisID: "y",
          tension: 0.3,
        },
        {
          label: "Overall hire rate %",
          data: rows.map((row) => row.hire_rate_pct),
          borderColor: leadColors.overall,
          backgroundColor: "transparent",
          yAxisID: "y1",
          tension: 0.3,
        },
        {
          label: "Leads-only rate %",
          data: rows.map((row) => leadsOnlyRate(row)),
          borderColor: leadColors.hired,
          backgroundColor: "transparent",
          borderDash: [5, 4],
          yAxisID: "y1",
          tension: 0.3,
        },
      ],
    }),
    [labels, rows],
  );

  const hiresBySource = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: rows.map((row) => row.hired_by_leads),
          backgroundColor: leadColors.hired,
          stack: "hires",
        },
        {
          label: "Lead base",
          data: rows.map((row) => row.hired_by_leadbase),
          backgroundColor: leadColors.leadbase,
          stack: "hires",
        },
        {
          label: "Referral",
          data: rows.map((row) => row.hired_by_referral),
          backgroundColor: leadColors.referral,
          stack: "hires",
        },
      ],
    }),
    [labels, rows],
  );

  const sourceShare = useMemo(
    () => ({
      labels: ["Leads", "Lead base", "Referral"],
      datasets: [
        {
          data: [
            summary.hiredFromLeads,
            summary.hiredFromLeadBase,
            summary.hiredFromReferral,
          ],
          backgroundColor: [
            leadColors.hired,
            leadColors.leadbase,
            leadColors.referral,
          ],
          borderWidth: 0,
        },
      ],
    }),
    [summary],
  );

  const rateBySource = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads rate %",
          data: rows.map((row) => leadsOnlyRate(row)),
          borderColor: leadColors.hired,
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Lead base rate %",
          data: rows.map((row) => leadBaseRate(row)),
          borderColor: leadColors.leadbase,
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Overall %",
          data: rows.map((row) => row.hire_rate_pct),
          borderColor: leadColors.overall,
          backgroundColor: "transparent",
          borderDash: [4, 4],
          tension: 0.3,
        },
      ],
    }),
    [labels, rows],
  );

  const adSpend = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Ad spend",
          data: rows.map((row) => row.ad_spend_usd),
          backgroundColor: leadColors.spend,
        },
      ],
    }),
    [labels, rows],
  );

  const costPerHire = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "CPH (leads stream)",
          data: rows.map((row) => cphLeads(row)),
          borderColor: leadColors.hired,
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "CPH (overall)",
          data: rows.map((row) => cphOverall(row)),
          borderColor: leadColors.overall,
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    }),
    [labels, rows],
  );

  const forecastChart = useMemo(
    () => ({
      labels: forecast.map((row) => row.month),
      datasets: [
        {
          label: "Projected leads",
          data: forecast.map((row) => row._leads),
          backgroundColor: leadColors.leads,
        },
        {
          label: "Projected hires",
          data: forecast.map((row) => row.totalHired),
          backgroundColor: leadColors.hired,
        },
      ],
    }),
    [forecast],
  );

  if (loading) {
    return (
      <EyeLoadingDefault fullPage size="lg" label="Loading lead management" />
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Live sheet unavailable ({error}). Showing fallback sample data.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border border-border bg-surface p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            JM · Lead management
          </p>
          <p className="mt-2 text-sm text-foreground">{rangeLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {rows.length} months from Google Sheets
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-success">
          {error ? "Fallback data" : "Live data"}
        </p>
      </div>

      <nav className="flex flex-wrap gap-1 border border-border bg-surface p-1">
        {VIEWS.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={cn(
                "min-w-[7.5rem] flex-1 px-3 py-2.5 text-left transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent-dim hover:text-foreground",
              )}
            >
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em]">
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px]",
                  active ? "text-background/70" : "text-muted",
                )}
              >
                {item.hint}
              </span>
            </button>
          );
        })}
      </nav>

      {view === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCardDefault
              label="Total leads"
              value={summary.totalLeads.toLocaleString()}
              change={`${summary.avgLeadsPerMonth}/mo avg`}
              trend="neutral"
            />
            <StatCardDefault
              label="Total hired"
              value={String(summary.totalHired)}
              change={`${summary.overallRate}% overall rate`}
              trend="up"
            />
            <StatCardDefault
              label="Lead → hire rate"
              value={`${summary.leadHireRate}%`}
              change={`${summary.hiredFromLeads} from leads stream`}
              trend="neutral"
            />
            <StatCardDefault
              label="Ad spend"
              value={money(summary.totalSpend)}
              change={`CPH ${money(summary.avgCostPerHire)}`}
              trend="neutral"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Leads vs hires"
              description="Monthly volume from the sheet"
            >
              <Bar data={leadsByMonth} options={barOptions()} />
            </ChartPanel>
            <ChartPanel
              title="Hire mix"
              description="Where hires came from across the period"
            >
              <Doughnut data={sourceShare} options={doughnutOptions()} />
            </ChartPanel>
          </div>

          <section className="border border-border bg-surface p-5">
            <h3 className="text-sm font-medium tracking-wide text-foreground">
              Month by month
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Exact sheet fields: leads, hired by channel, rate, spend
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted">
                    <th className="pb-3 pr-4 font-medium">Month</th>
                    <th className="pb-3 pr-4 font-medium">Leads</th>
                    <th className="pb-3 pr-4 font-medium">Hired</th>
                    <th className="pb-3 pr-4 font-medium">By leads</th>
                    <th className="pb-3 pr-4 font-medium">Lead base</th>
                    <th className="pb-3 pr-4 font-medium">Referral</th>
                    <th className="pb-3 pr-4 font-medium">Rate</th>
                    <th className="pb-3 font-medium">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.month}
                      className="border-b border-border/60 text-muted-foreground last:border-0"
                    >
                      <td className="py-3 pr-4 text-foreground">{row.month}</td>
                      <td className="py-3 pr-4 font-mono">{row.leads}</td>
                      <td className="py-3 pr-4 font-mono">{row.hired}</td>
                      <td className="py-3 pr-4 font-mono">
                        {row.hired_by_leads}
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        {row.hired_by_leadbase}
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        {row.hired_by_referral}
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        {row.hire_rate_pct}%
                      </td>
                      <td className="py-3 font-mono">
                        {money(row.ad_spend_usd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {view === "performance" ? (
        <div className="space-y-6">
          <ChartPanel
            title="Leads vs performance bands"
            description="High / normal / low bands from period average"
            className="[&>div:last-child]:h-80"
          >
            <Chart type="bar" data={performanceBands} options={barOptions()} />
          </ChartPanel>
          <ChartPanel
            title="Volume and hire rate"
            description="Leads (left) with overall and leads-only rates (right)"
            className="[&>div:last-child]:h-80"
          >
            <Line data={hireRateTrend} options={dualLineOptions()} />
          </ChartPanel>
        </div>
      ) : null}

      {view === "sources" ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Hires by source"
              description="Stacked monthly hires from leads, lead base, referral"
            >
              <Bar data={hiresBySource} options={barOptions(true)} />
            </ChartPanel>
            <ChartPanel
              title="Source share"
              description="Period totals"
            >
              <Doughnut data={sourceShare} options={doughnutOptions()} />
            </ChartPanel>
          </div>
          <ChartPanel
            title="Hire rate by stream"
            description="Leads-only, lead base, and overall rate %"
            className="[&>div:last-child]:h-80"
          >
            <Line data={rateBySource} options={lineOptions()} />
          </ChartPanel>
        </div>
      ) : null}

      {view === "cost" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardDefault
              label="Total ad spend"
              value={money(summary.totalSpend)}
            />
            <StatCardDefault
              label="Avg CPH (leads)"
              value={money(summary.avgCostPerHire)}
            />
            <StatCardDefault
              label="Overall CPH"
              value={
                summary.totalHired > 0
                  ? money(summary.totalSpend / summary.totalHired)
                  : "—"
              }
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel title="Monthly ad spend" description="Amount spent">
              <Bar data={adSpend} options={barOptions()} />
            </ChartPanel>
            <ChartPanel
              title="Cost per hire"
              description="Leads stream vs overall"
            >
              <Line data={costPerHire} options={lineOptions()} />
            </ChartPanel>
          </div>
        </div>
      ) : null}

      {view === "forecast" ? (
        <div className="space-y-6">
          <ChartPanel
            title="3-month projection"
            description="Weighted trend from the last months on the sheet"
          >
            <Bar data={forecastChart} options={barOptions()} />
          </ChartPanel>
          <section className="border border-border bg-surface p-5">
            <h3 className="text-sm font-medium tracking-wide text-foreground">
              Forecast detail
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted">
                    <th className="pb-3 pr-4 font-medium">Month</th>
                    <th className="pb-3 pr-4 font-medium">Leads</th>
                    <th className="pb-3 pr-4 font-medium">Hired (leads)</th>
                    <th className="pb-3 pr-4 font-medium">Lead base</th>
                    <th className="pb-3 pr-4 font-medium">Referral</th>
                    <th className="pb-3 pr-4 font-medium">Total</th>
                    <th className="pb-3 pr-4 font-medium">Overall rate</th>
                    <th className="pb-3 pr-4 font-medium">Spend</th>
                    <th className="pb-3 font-medium">CPH leads</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((row) => (
                    <tr
                      key={row.month}
                      className="border-b border-border/60 text-muted-foreground last:border-0"
                    >
                      <td className="py-3 pr-4 text-foreground">{row.month}</td>
                      <td className="py-3 pr-4 font-mono">{row.leads}</td>
                      <td className="py-3 pr-4 font-mono">{row.hiredLeads}</td>
                      <td className="py-3 pr-4 font-mono">{row.hiredLB}</td>
                      <td className="py-3 pr-4 font-mono">{row.hiredRef}</td>
                      <td className="py-3 pr-4 font-mono">{row.totalHired}</td>
                      <td className="py-3 pr-4 font-mono">{row.overallRate}</td>
                      <td className="py-3 pr-4 font-mono">{row.adSpend}</td>
                      <td className="py-3 font-mono">{row.cphLeads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
