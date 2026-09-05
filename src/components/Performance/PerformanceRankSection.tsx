"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmployeePerformancePanel from "@/components/Performance/EmployeePerformancePanel";
import DiagnosisTagBadge from "@/components/UI/DiagnosisTagBadge";
import HrPerformanceRankBadge from "@/components/UI/HrPerformanceRankBadge";
import StatCardDefault from "@/components/UI/StatCardDefault";
import { employeeLabel } from "@/components/HrCompanyDashboard/SectionNav";
import { usePerformanceRankings } from "@/hooks/usePerformanceRankings";
import type { Employee } from "@/lib/types";
import { cn } from "@/utils/cn";
import { HR_PERFORMANCE_TIER_LABELS } from "@/utils/performance-ranking";

type Props = {
  employees: Employee[];
  onSelectPerson?: (employee: Employee) => void;
};

export default function PerformanceRankSection({
  employees,
  onSelectPerson,
}: Props) {
  const { rankedEmployees, rankings, summary } =
    usePerformanceRankings(employees);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "flagged" | "top">("all");

  const visible = useMemo(() => {
    if (filter === "flagged") {
      return rankedEmployees.filter(
        (e) => (rankings.get(e.id)?.tags.length ?? 0) > 0,
      );
    }
    if (filter === "top") {
      return rankedEmployees.filter((e) => {
        const tier = rankings.get(e.id)?.tier;
        return tier === "advanced" || tier === "distinguished";
      });
    }
    return rankedEmployees;
  }, [filter, rankedEmployees, rankings]);

  const selected =
    selectedId != null
      ? employees.find((e) => e.id === selectedId) ?? null
      : null;
  const selectedProfile = selected ? rankings.get(selected.id) : undefined;

  if (!employees.length) {
    return (
      <p className="border border-border bg-surface px-6 py-8 text-sm text-muted-foreground">
        No HR employees with metrics in this period.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border border-border bg-surface p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            HR performance ranking
          </p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Recruiter tiers vs peers in the same company, department, and tenure
            band. Applies to Human Resources only — Safety and other departments
            use separate models later.
          </p>
        </div>
        <Link
          href="/hr-performance/guide"
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
        >
          How ranking works →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          id="rank-top"
          label="Advanced + Distinguished"
          value={String(summary.advanced + summary.distinguished)}
          trend="neutral"
        />
        <StatCardDefault
          id="rank-flagged"
          label="Diagnosis flags"
          value={String(summary.flagged)}
          trend="down"
        />
        <StatCardDefault
          id="rank-at-risk"
          label="At risk"
          value={String(summary.atRisk)}
          trend="down"
        />
        <StatCardDefault
          id="rank-total"
          label="Ranked pool"
          value={String(summary.total)}
          trend="neutral"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["top", "Top tier"],
            ["flagged", "Flagged"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors",
              filter === id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-accent-dim/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                {["Rank", "Employee", "Tier", "PI", "Flags", "Hires", "Leads"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((employee, index) => {
                const profile = rankings.get(employee.id);
                if (!profile) return null;
                const isSelected = selectedId === employee.id;

                return (
                  <tr
                    key={employee.id}
                    className={cn(
                      "cursor-pointer border-b border-border last:border-b-0 hover:bg-accent-dim/20",
                      isSelected && "bg-accent-dim/40",
                    )}
                    onClick={() => setSelectedId(employee.id)}
                  >
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPerson?.(employee);
                        }}
                      >
                        {employeeLabel(employee)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <HrPerformanceRankBadge
                        tier={profile.tier}
                        confidence={profile.confidence}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">
                      {profile.performanceIndex}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {profile.tags.length ? (
                          profile.tags.map((tag) => (
                            <DiagnosisTagBadge key={tag} tag={tag} />
                          ))
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {employee.metrics?.hires ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {employee.metrics?.leads ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border border-border bg-surface p-5">
          {selected && selectedProfile ? (
            <EmployeePerformancePanel
              employee={selected}
              profile={selectedProfile}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an employee to view scores, diagnosis, and 30/60/90 plan.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        Tiers (low → high):{" "}
        {Object.values(HR_PERFORMANCE_TIER_LABELS).join(" → ")}. * = provisional
        (limited call/lead volume).
      </p>
    </div>
  );
}
