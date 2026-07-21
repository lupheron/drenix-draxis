"use client";

import { useMemo, useState } from "react";
import type { LeadsDataRow } from "@/types/leads";
import {
  cphLeads,
  leadBaseRate,
  leadsOnlyRate,
} from "@/components/Analytics/leadsMetrics";

export default function MonthOverMonthCard({ data }: { data: LeadsDataRow[] }) {
  const [selected, setSelected] = useState<string[]>(() =>
    data.length ? [data[data.length - 1].month] : [],
  );

  const rows = useMemo(
    () => data.filter((row) => selected.includes(row.month)),
    [data, selected],
  );

  function toggleMonth(month: string) {
    setSelected((current) =>
      current.includes(month)
        ? current.filter((item) => item !== month)
        : [...current, month],
    );
  }

  return (
    <section className="border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Monthly data viewer
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Select months to compare side by side
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.map((row) => {
            const active = selected.includes(row.month);
            return (
              <button
                key={row.month}
                type="button"
                onClick={() => toggleMonth(row.month)}
                className={
                  active
                    ? "border border-warning/40 bg-warning/15 px-3 py-1 text-xs text-warning"
                    : "border border-border px-3 py-1 text-xs text-muted-foreground hover:border-border-strong"
                }
              >
                {row.month}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-2">Metric</th>
              {rows.map((row) => (
                <th key={row.month} className="px-3 py-2">
                  {row.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Total leads", get: (row: LeadsDataRow) => row.leads },
              {
                label: "Hired — Leads",
                get: (row: LeadsDataRow) => row.hired_by_leads,
              },
              {
                label: "Hired — Lead Base",
                get: (row: LeadsDataRow) => row.hired_by_leadbase,
              },
              {
                label: "Hired — Referral",
                get: (row: LeadsDataRow) => row.hired_by_referral,
              },
              { label: "Total hired", get: (row: LeadsDataRow) => row.hired },
              {
                label: "Hire rate (leads)",
                get: (row: LeadsDataRow) => `${leadsOnlyRate(row)}%`,
              },
              {
                label: "Hire rate (Lead Base)",
                get: (row: LeadsDataRow) => `${leadBaseRate(row)}%`,
              },
              {
                label: "Overall hire rate",
                get: (row: LeadsDataRow) => `${row.hire_rate_pct}%`,
              },
              {
                label: "Ad spend",
                get: (row: LeadsDataRow) =>
                  `$${Math.round(row.ad_spend_usd).toLocaleString()}`,
              },
              {
                label: "CPH (leads)",
                get: (row: LeadsDataRow) => `$${cphLeads(row).toLocaleString()}`,
              },
            ].map((metric) => (
              <tr key={metric.label} className="border-b border-border/70">
                <td className="px-3 py-2 text-muted-foreground">
                  {metric.label}
                </td>
                {rows.map((row) => (
                  <td key={row.month} className="px-3 py-2 text-foreground">
                    {metric.get(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
