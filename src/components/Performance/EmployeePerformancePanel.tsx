"use client";

import DiagnosisTagBadge from "@/components/UI/DiagnosisTagBadge";
import HrPerformanceRankBadge from "@/components/UI/HrPerformanceRankBadge";
import type { Employee } from "@/lib/types";
import type { EmployeePerformanceProfile } from "@/types/performance-ranking";
import { cn } from "@/utils/cn";

type Props = {
  employee: Employee;
  profile: EmployeePerformanceProfile;
  compact?: boolean;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 bg-border">
        <div
          className={cn(
            "h-full transition-all",
            value >= 68
              ? "bg-success"
              : value >= 45
                ? "bg-warning"
                : "bg-danger",
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default function EmployeePerformancePanel({
  employee,
  profile,
  compact = false,
}: Props) {
  const metrics = employee.metrics;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <HrPerformanceRankBadge
          tier={profile.tier}
          confidence={profile.confidence}
        />
        <span className="text-xs text-muted-foreground">
          PI {profile.performanceIndex} · {profile.tenureBand} tenure · cohort{" "}
          {profile.cohortKey}
        </span>
      </div>

      {profile.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <DiagnosisTagBadge key={tag} tag={tag} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No diagnosis flags — performance on track for cohort.
        </p>
      )}

      {!compact ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreBar label="Activity" value={profile.scores.activity} />
            <ScoreBar label="Conversion" value={profile.scores.conversion} />
            <ScoreBar label="Lead quality" value={profile.scores.quality} />
            <ScoreBar label="Knowledge" value={profile.scores.knowledge} />
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <MetricCompare
              label="Calls vs expected"
              ratio={profile.ratios.callsVsExpected}
              raw={metrics?.calls_made ?? 0}
            />
            <MetricCompare
              label="Minutes vs expected"
              ratio={profile.ratios.minutesVsExpected}
              raw={metrics?.minutes_on_call ?? 0}
            />
            <MetricCompare
              label="Hire rate vs cohort"
              ratio={profile.ratios.hireRateVsExpected}
              raw={Math.round(profile.hireRate * 100)}
              suffix="%"
            />
            <MetricCompare
              label="Loaded rate vs cohort"
              ratio={profile.ratios.loadedRateVsExpected}
              raw={Math.round(profile.loadedRate * 100)}
              suffix="%"
            />
          </dl>

          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted">
              30 / 60 / 90 day plan
            </h3>
            <div className="space-y-2">
              {profile.plans.map((plan) => (
                <div
                  key={`${plan.horizon}-${plan.metricKey}`}
                  className="border border-border bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">
                      {plan.horizon}
                    </p>
                    <p className="text-sm text-foreground">
                      {plan.current}
                      {plan.unit === "%" ? "%" : ""} → {plan.target}
                      {plan.unit === "%" ? "%" : ""}{" "}
                      <span className="text-muted-foreground">({plan.unit})</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCompare({
  label,
  ratio,
  raw,
  suffix = "",
}: {
  label: string;
  ratio: number;
  raw: number;
  suffix?: string;
}) {
  const pct = Math.round(ratio * 100);
  const tone =
    pct >= 100 ? "text-success" : pct >= 75 ? "text-foreground" : "text-warning";

  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
        {label}
      </dt>
      <dd className={cn("mt-1 font-mono text-sm", tone)}>
        {raw}
        {suffix} · {pct}% of cohort
      </dd>
    </div>
  );
}
