"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeadsDataRow } from "@/types/leads";
import { SECTIONS, type SectionId } from "@/components/LeadsDashboard/constants";
import { LeadsSectionContent } from "@/components/LeadsDashboard/LeadsSectionContent";
import { LeadsThemeContext } from "@/components/LeadsDashboard/theme";
import { cn } from "@/utils/cn";

type DraxisAnalyticsDashboardProps = {
  data: LeadsDataRow[];
  error?: string;
  company?: string;
};

export default function DraxisAnalyticsDashboard({
  data,
  error,
  company = "JM",
}: DraxisAnalyticsDashboardProps) {
  const [section, setSection] = useState<SectionId>("overview");

  const activeSection = useMemo(
    () => SECTIONS.find((item) => item.id === section) ?? SECTIONS[0],
    [section],
  );

  return (
    <LeadsThemeContext.Provider value="draxis">
      <div className="space-y-6 px-8 py-8">
        {error ? (
          <div className="rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Live sheet unavailable ({error}). Showing fallback sample data.
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
              {company} · Lead analytics
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.length} months loaded from Google Sheets
            </p>
            <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "whitespace-nowrap rounded-sm border px-3 py-2.5 text-left text-sm transition-colors",
                    section === item.id
                      ? "border-border-strong bg-accent-dim text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/40",
                  )}
                >
                  <span className="mr-2 opacity-70">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-light tracking-wide text-foreground">
                {activeSection.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeSection.desc}
              </p>
            </div>

            <LeadsSectionContent id={section} data={data} />
          </div>
        </div>

        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          Prefer the standalone dashboard?{" "}
          <Link
            href="/analytics/standalone"
            className="text-foreground underline underline-offset-4 hover:text-warning"
          >
            Visit analytics-only website
          </Link>
        </p>
      </div>
    </LeadsThemeContext.Provider>
  );
}
