"use client";

import { useEffect, useRef, useState } from "react";
import type { LeadsDataRow } from "@/types/leads";
import { CardTitle } from "@/components/LeadsDashboard/ui";
import { cn } from "@/utils/cn";

function mapMonthRow(row: LeadsDataRow) {
  const leadsRate =
    row.leads > 0 ? ((row.hired_by_leads / row.leads) * 100).toFixed(1) : "0.0";
  const lbRate =
    row.leads > 0
      ? ((row.hired_by_leadbase / row.leads) * 100).toFixed(1)
      : "0.0";

  return {
    month: row.month,
    leads: row.leads,
    hiredLeads: row.hired_by_leads,
    hiredLB: row.hired_by_leadbase,
    hiredRef: row.hired_by_referral,
    totalHired: row.hired,
    leadsRate: `${leadsRate}%`,
    lbRate: `${lbRate}%`,
    overallRate: `${row.hire_rate_pct.toFixed(1)}%`,
    adSpend: `$${row.ad_spend_usd.toLocaleString()}`,
    cphLeads:
      row.hired_by_leads > 0
        ? `$${Math.round(row.ad_spend_usd / row.hired_by_leads).toLocaleString()}`
        : "—",
    cphLB:
      row.hired_by_leadbase > 0
        ? `$${Math.round(row.ad_spend_usd / row.hired_by_leadbase).toLocaleString()}`
        : "—",
  };
}

const METRICS = [
  { key: "leads", label: "Total leads", accent: "#185FA5" },
  { key: "hiredLeads", label: "Hired — Leads", accent: "#1D9E75" },
  { key: "hiredLB", label: "Hired — Lead Base", accent: "#185FA5" },
  { key: "hiredRef", label: "Hired — Referral", accent: "#BA7517" },
  { key: "totalHired", label: "Total hired", accent: "#085041" },
  { key: "leadsRate", label: "Hire rate (leads only)", accent: "#185FA5" },
  { key: "lbRate", label: "Hire rate (Lead Base only)", accent: "#185FA5" },
  { key: "overallRate", label: "Overall hire rate", accent: "#534AB7" },
  { key: "adSpend", label: "Ad spend", accent: "#BA7517" },
  { key: "cphLeads", label: "CPH (leads only)", accent: "#E24B4A" },
  { key: "cphLB", label: "CPH (Lead Base only)", accent: "#185FA5" },
] as const;

export default function MonthOverMonthCard({ data }: { data: LeadsDataRow[] }) {
  const months = data.map((row) => row.month);
  const defaultMonth = months[months.length - 1] ?? "";
  const [selected, setSelected] = useState<string[]>([defaultMonth]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const rows = data
    .filter((row) => selected.includes(row.month))
    .map(mapMonthRow);

  function toggleMonth(month: string) {
    setSelected((current) =>
      current.includes(month)
        ? current.filter((item) => item !== month)
        : [...current, month],
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle
          title="Monthly data viewer"
          subtitle="Select months to review and plan ahead"
        />

        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-semibold",
              open
                ? "border-warning/40 bg-warning/15 text-warning"
                : "border-border text-muted-foreground hover:border-border-strong",
            )}
          >
            {selected.length} month{selected.length === 1 ? "" : "s"} selected ▾
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-sm border border-border bg-surface p-1.5 shadow-xl">
              {months.map((month) => (
                <label
                  key={month}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent-dim/50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(month)}
                    onChange={() => toggleMonth(month)}
                  />
                  {month}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky top-0 border-b border-border bg-surface-elevated px-2 py-1.5 text-left text-muted-foreground">
                Metric
              </th>
              {rows.map((row) => (
                <th
                  key={row.month}
                  className="sticky top-0 whitespace-nowrap border-b border-border bg-surface-elevated px-2 py-1.5 text-center font-semibold text-foreground"
                >
                  {row.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, index) => (
              <tr
                key={metric.key}
                className={index % 2 === 1 ? "bg-accent-dim/20" : undefined}
              >
                <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">
                  {metric.label}
                </td>
                {rows.map((row) => (
                  <td
                    key={row.month}
                    className="px-2 py-1.5 text-center font-semibold"
                    style={{ color: metric.accent }}
                  >
                    {String(row[metric.key as keyof typeof row])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
