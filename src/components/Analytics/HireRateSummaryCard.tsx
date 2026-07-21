"use client";

import { useMemo } from "react";
import type { LeadsDataRow } from "@/types/leads";
import { MetricTile } from "@/components/Analytics/ChartCard";
import { periodSummary } from "@/components/Analytics/leadsMetrics";

export default function HireRateSummaryCard({ data }: { data: LeadsDataRow[] }) {
  const summary = useMemo(() => periodSummary(data), [data]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Lead → hire rate"
        value={`${summary.leadHireRate}%`}
        hint="Leads pipeline only"
      />
      <MetricTile
        label="Hired from leads"
        value={String(summary.hiredFromLeads)}
        hint={`${summary.totalLeads.toLocaleString()} total leads`}
      />
      <MetricTile
        label="Avg leads / month"
        value={String(summary.avgLeadsPerMonth)}
      />
      <MetricTile
        label="Avg cost per hire"
        value={`$${summary.avgCostPerHire.toLocaleString()}`}
        hint="Leads stream CPH"
      />
    </div>
  );
}
