"use client";

import { useMemo } from "react";
import type { LeadsDataRow } from "@/types/leads";
import { periodSummary, round } from "@/components/Analytics/leadsMetrics";

const STREAMS = [
  { key: "hiredFromLeads", label: "Leads", color: "bg-sky-400" },
  { key: "hiredFromLeadBase", label: "Lead Base", color: "bg-violet-400" },
  { key: "hiredFromReferral", label: "Referral", color: "bg-amber-400" },
] as const;

export default function HireRateBreakdownCard({
  data,
}: {
  data: LeadsDataRow[];
}) {
  const summary = useMemo(() => periodSummary(data), [data]);

  return (
    <section className="border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Overall hire rate
          </p>
          <p className="mt-2 text-4xl font-light text-foreground">
            {summary.overallRate}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.totalHired} hired · {summary.totalLeads.toLocaleString()}{" "}
            leads
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STREAMS.map((stream) => {
          const count = summary[stream.key];
          const share =
            summary.totalHired > 0
              ? round((count / summary.totalHired) * 100)
              : 0;

          return (
            <div key={stream.key} className="border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stream.label}</span>
                <span className="text-foreground">{count}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent-dim">
                <div
                  className={`h-full ${stream.color}`}
                  style={{ width: `${share}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">{share}% of hires</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
