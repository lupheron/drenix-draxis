"use client";

import Link from "next/link";
import DiagnosisTagBadge from "@/components/UI/DiagnosisTagBadge";
import HrPerformanceRankBadge from "@/components/UI/HrPerformanceRankBadge";
import {
  HR_HIGHEST_TIER,
  HR_PERFORMANCE_TIER_LABELS,
} from "@/utils/performance-ranking";
import type { HrPerformanceTier } from "@/types/performance-ranking";

type Props = {
  audience: "admin" | "employee";
};

const TIER_ORDER: HrPerformanceTier[] = [
  "provisional",
  "developing",
  "proficient",
  "advanced",
  "distinguished",
  "at_risk",
];

export default function HrPerformanceGuideContent({ audience }: Props) {
  const isAdmin = audience === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-12">
      <div>
        <Link
          href={isAdmin ? "/command-center" : "/command-center"}
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-light tracking-wide text-foreground">
          How HR performance ranking works
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isAdmin
            ? "For managers and admins — Human Resources recruiters only. Safety and other departments will use separate ranking models."
            : "For HR employees — see your tier, what drives it, and how to improve."}
        </p>
      </div>

      <section className="space-y-4 border border-border bg-surface p-6">
        <h2 className="text-lg font-light text-foreground">Scope</h2>
        <p className="text-sm text-muted-foreground">
          Ranking applies to <strong className="text-foreground">HR recruiters</strong>{" "}
          (JM, BP, WF) compared to peers in the same company, department, and tenure
          band. It is <em>not</em> used for Safety or other roles yet.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">Performance tiers</h2>
        <p className="text-sm text-muted-foreground">
          Highest tier:{" "}
          <HrPerformanceRankBadge tier={HR_HIGHEST_TIER} /> — sustained top performance
          vs cohort expectation.
        </p>
        <ul className="space-y-3">
          {TIER_ORDER.filter((t) => t !== "at_risk").map((tier) => (
            <li
              key={tier}
              className="flex flex-wrap items-center gap-3 border border-border bg-surface px-4 py-3"
            >
              <HrPerformanceRankBadge tier={tier} />
              <span className="text-sm text-muted-foreground">
                {tierDescriptions[tier]}
              </span>
            </li>
          ))}
          <li className="flex flex-wrap items-center gap-3 border border-danger/30 bg-danger/5 px-4 py-3">
            <HrPerformanceRankBadge tier="at_risk" />
            <span className="text-sm text-muted-foreground">
              Sustained underperformance after ramp — requires manager review.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">
          Performance Index (PI)
        </h2>
        <p className="text-sm text-muted-foreground">
          Your tier is driven by a 0–100 score blended from four pillars:
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ["Activity (25%)", "Calls, talk minutes, attendance vs cohort median"],
            [
              "Conversion (40%)",
              "Hires per lead and loaded drivers per hire — rewards efficiency, not volume alone",
            ],
            [
              "Lead quality (25%)",
              "Reject / N/A share vs peers — bad lists hurt rank even with high call counts",
            ],
            [
              "Knowledge (10%)",
              "Call execution (AI review when available) — script, objections, next steps",
            ],
          ].map(([title, body]) => (
            <div key={title} className="border border-border bg-surface p-4">
              <dt className="text-sm text-foreground">{title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          Example: 130 leads / 5 hires vs 80 leads / 10 hires — the second recruiter
          scores higher on <em>conversion</em> even with fewer leads.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">Fair comparison</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Tenure bands</strong> — 0–30, 31–90,
            91–180, 180+ days; new hires are not compared at full cohort expectations
            until ramp completes.
          </li>
          <li>
            <strong className="text-foreground">Provisional</strong> — first 30 days
            or low activity → tier withheld until enough data (* on badge = low
            confidence).
          </li>
          <li>
            <strong className="text-foreground">Same company</strong> — JM vs JM, not
            JM vs BP.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">Diagnosis flags</h2>
        <p className="text-sm text-muted-foreground">
          Separate from tier — tells managers <em>why</em> someone is stuck and what
          plan to use:
        </p>
        <div className="flex flex-wrap gap-3">
          <DiagnosisTagBadge tag="lazy" />
          <DiagnosisTagBadge tag="lead_quality" />
          <DiagnosisTagBadge tag="knowledge" />
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Lazy</strong> — low calls/minutes and
            low hires → discipline / activity plan.
          </li>
          <li>
            <strong className="text-foreground">Lead quality</strong> — working, but
            too many rejects/N/A → list hygiene and qualification coaching.
          </li>
          <li>
            <strong className="text-foreground">Knowledge</strong> — active, but
            conversion weak with OK leads → call coaching and AI review themes.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">30 / 60 / 90 day plans</h2>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Auto-suggested targets based on diagnosis — track weekly in Command Center or HR → Performance rank."
            : "Your manager sets targets from your diagnosis — activity, conversion, or coaching milestones at 30, 60, and 90 days."}
        </p>
      </section>

      {isAdmin ? (
        <section className="space-y-2 border border-border bg-surface p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-light text-foreground">Admin notes</h2>
          <p>
            Manual letter <strong className="text-foreground">Grade</strong> (A–F) is
            independent of performance tier. Tier is computed from RingCentral,
            Monday.com pipeline, and attendance for the selected period.
          </p>
          <p>
            Command Center → HR → <strong className="text-foreground">HR rank</strong>{" "}
            column · HR dashboard → <strong className="text-foreground">HR rank</strong>{" "}
            section.
          </p>
        </section>
      ) : (
        <section className="space-y-2 border border-border bg-surface p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-light text-foreground">Your view</h2>
          <p>
            On the client portal you see your tier, PI breakdown, how you compare to
            your cohort, and your current 30/60/90 targets. Rank updates when period
            metrics refresh.
          </p>
        </section>
      )}

      <p className="text-xs text-muted">
        Tiers: {Object.values(HR_PERFORMANCE_TIER_LABELS).join(" · ")}
      </p>
    </div>
  );
}

const tierDescriptions: Record<
  Exclude<HrPerformanceTier, "at_risk">,
  string
> = {
  provisional: "Not enough tenure or activity to rank yet.",
  developing: "Below cohort standard — ramping or needs improvement.",
  proficient: "Meets expected performance for your tenure band.",
  advanced: "Clearly above cohort expectation.",
  distinguished: "Top sustained performance vs peers.",
};
