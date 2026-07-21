"use client";

import { useMemo, useState } from "react";
import type { LeadsDataRow } from "@/types/leads";
import { cn } from "@/utils/cn";
import HireRateSummaryCard from "@/components/Analytics/HireRateSummaryCard";
import HireRateBreakdownCard from "@/components/Analytics/HireRateBreakdownCard";
import MonthOverMonthCard from "@/components/Analytics/MonthOverMonthCard";
import PerformanceBandsChart from "@/components/Analytics/PerformanceBandsChart";
import HireRateBandsChart from "@/components/Analytics/HireRateBandsChart";
import LeadsHireRateChart from "@/components/Analytics/LeadsHireRateChart";
import HiresBySourceChart from "@/components/Analytics/HiresBySourceChart";
import SpendingBandsChart from "@/components/Analytics/SpendingBandsChart";
import CostPerHireChart from "@/components/Analytics/CostPerHireChart";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Lead Performance" },
  { id: "cost-spend", label: "Cost & Spend" },
  { id: "sources", label: "Source Analysis" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

type DashboardContentProps = {
  data: LeadsDataRow[];
  companyLabel: string;
  sheetError?: string;
};

export default function DashboardContent({
  data,
  companyLabel,
  sheetError,
}: DashboardContentProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const monthCount = useMemo(() => data.length, [data]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="border-b border-border bg-surface px-4 py-4 lg:w-56 lg:border-b-0 lg:border-r">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
          {companyLabel}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {monthCount} months loaded
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "whitespace-nowrap rounded-sm border px-3 py-2 text-left text-sm transition-colors",
                activeSection === section.id
                  ? "border-border-strong bg-accent-dim text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/40",
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 space-y-6 p-6">
        {sheetError ? (
          <div className="rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Live sheet unavailable ({sheetError}). Showing fallback sample data.
          </div>
        ) : null}

        {activeSection === "overview" ? (
          <>
            <HireRateSummaryCard data={data} />
            <HireRateBreakdownCard data={data} />
            <MonthOverMonthCard data={data} />
          </>
        ) : null}

        {activeSection === "performance" ? (
          <>
            <PerformanceBandsChart data={data} />
            <HireRateBandsChart data={data} />
            <LeadsHireRateChart data={data} />
          </>
        ) : null}

        {activeSection === "cost-spend" ? (
          <>
            <SpendingBandsChart data={data} />
            <CostPerHireChart data={data} />
          </>
        ) : null}

        {activeSection === "sources" ? <HiresBySourceChart data={data} /> : null}
      </div>
    </div>
  );
}
