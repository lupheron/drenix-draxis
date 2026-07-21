"use client";

import type { LeadsDataRow } from "@/types/leads";
import type { SectionId } from "@/components/LeadsDashboard/constants";
import { LeadCard } from "@/components/LeadsDashboard/ui";
import HireRateSummaryCard from "@/components/LeadsDashboard/HireRateSummaryCard";
import HireRateBreakdownCard from "@/components/LeadsDashboard/HireRateBreakdownCard";
import MonthOverMonthCard from "@/components/LeadsDashboard/MonthOverMonthCard";
import ForecastCard from "@/components/LeadsDashboard/ForecastCard";
import {
  AdSpendChart,
  CostPerHireChart,
  HireRateBandsChart,
  HireRateBySourceChart,
  HireRateLeadsOnlyBandsChart,
  HiresBySourceChart,
  LeadBaseBandsChart,
  LeadsHireRateChart,
  OverallCostPerHireChart,
  PerformanceBandsChart,
  SpendingBandsChart,
} from "@/components/LeadsDashboard/charts";

const twoCol = "grid grid-cols-1 gap-4 xl:grid-cols-2";

export function LeadsSectionContent({
  id,
  data,
}: {
  id: SectionId;
  data: LeadsDataRow[];
}) {
  switch (id) {
    case "overview":
      return (
        <div className="space-y-4">
          <div className={twoCol}>
            <LeadCard className="min-h-[220px]">
              <HireRateSummaryCard data={data} />
            </LeadCard>
            <LeadCard className="min-h-[220px]">
              <HireRateBreakdownCard data={data} />
            </LeadCard>
          </div>
          <LeadCard className="min-h-[280px] w-full">
            <MonthOverMonthCard data={data} />
          </LeadCard>
        </div>
      );
    case "forecast":
      return (
        <LeadCard className="min-h-[320px]">
          <ForecastCard data={data} />
        </LeadCard>
      );
    case "performance":
      return (
        <div className="space-y-4">
          <LeadCard className="h-[380px]">
            <PerformanceBandsChart data={data} />
          </LeadCard>
          <LeadCard className="h-[420px]">
            <HireRateBandsChart data={data} />
          </LeadCard>
          <LeadCard className="h-[400px]">
            <LeadsHireRateChart data={data} />
          </LeadCard>
        </div>
      );
    case "hire-rates":
      return (
        <div className="space-y-4">
          <div className={twoCol}>
            <LeadCard className="h-[400px]">
              <HireRateLeadsOnlyBandsChart data={data} />
            </LeadCard>
            <LeadCard className="h-[400px]">
              <LeadBaseBandsChart data={data} />
            </LeadCard>
          </div>
          <LeadCard className="h-[400px]">
            <HireRateBySourceChart />
          </LeadCard>
        </div>
      );
    case "cost-spend":
      return (
        <div className="space-y-4">
          <div className={twoCol}>
            <LeadCard className="h-[400px]">
              <SpendingBandsChart data={data} />
            </LeadCard>
            <LeadCard className="h-[400px]">
              <AdSpendChart data={data} />
            </LeadCard>
          </div>
          <div className={twoCol}>
            <LeadCard className="h-[400px]">
              <CostPerHireChart data={data} />
            </LeadCard>
            <LeadCard className="h-[400px]">
              <OverallCostPerHireChart data={data} />
            </LeadCard>
          </div>
        </div>
      );
    case "sources":
      return (
        <div className="space-y-4">
          <LeadCard className="h-[420px]">
            <HiresBySourceChart data={data} />
          </LeadCard>
          <LeadCard className="h-[400px]">
            <HireRateBySourceChart />
          </LeadCard>
        </div>
      );
  }
}
