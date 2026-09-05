import type { Employee } from "@/lib/types";
import type {
  DiagnosisTag,
  EmployeePerformanceProfile,
  HrPerformanceTier,
  PerformanceTarget,
  RankConfidence,
  TenureBand,
} from "@/types/performance-ranking";

const MIN_CALLS_FOR_RANK = 20;
const MIN_LEADS_FOR_RANK = 5;

export const HR_PERFORMANCE_TIER_LABELS: Record<HrPerformanceTier, string> = {
  provisional: "Provisional",
  developing: "Developing",
  proficient: "Proficient",
  advanced: "Advanced",
  distinguished: "Distinguished",
  at_risk: "At risk",
};

/** Highest HR performance tier for guides and UI copy. */
export const HR_HIGHEST_TIER: HrPerformanceTier = "distinguished";

export const DIAGNOSIS_LABELS: Record<DiagnosisTag, string> = {
  lazy: "Lazy",
  lead_quality: "Lead quality",
  knowledge: "Knowledge",
};

export const DIAGNOSIS_HINTS: Record<DiagnosisTag, string> = {
  lazy: "Low activity — calls and minutes below cohort expectation.",
  lead_quality: "Working, but pipeline is N/A or rejected too often.",
  knowledge: "Active, but conversion weak — coaching / call execution gap.",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function tenureDays(joinedAt: string): number {
  const joined = new Date(joinedAt.slice(0, 10));
  const now = new Date();
  if (Number.isNaN(joined.getTime())) return 365;
  return Math.max(
    0,
    Math.floor((now.getTime() - joined.getTime()) / 86_400_000),
  );
}

export function tenureBand(days: number): TenureBand {
  if (days <= 30) return "0-30";
  if (days <= 90) return "31-90";
  if (days <= 180) return "91-180";
  return "180+";
}

function rampFactor(days: number): number {
  if (days <= 30) return 0.4;
  if (days <= 60) return 0.7;
  if (days <= 90) return 0.85;
  return 1;
}

function cohortKey(employee: Employee, band: TenureBand): string {
  const company = employee.company ?? "ALL";
  const dept = employee.department ?? "hr";
  return `${company}:${dept}:${band}`;
}

type CohortStats = {
  medianCalls: number;
  medianMinutes: number;
  medianHireRate: number;
  medianLoadedRate: number;
  medianRejectRate: number;
};

function buildCohortStats(employees: Employee[]): Map<string, CohortStats> {
  const buckets = new Map<
    string,
    {
      calls: number[];
      minutes: number[];
      hireRates: number[];
      loadedRates: number[];
      rejectRates: number[];
    }
  >();

  for (const employee of employees) {
    const metrics = employee.metrics;
    if (!metrics) continue;

    const days = tenureDays(employee.joined_at);
    const band = tenureBand(days);
    const key = cohortKey(employee, band);
    const bucket = buckets.get(key) ?? {
      calls: [],
      minutes: [],
      hireRates: [],
      loadedRates: [],
      rejectRates: [],
    };

    const leads = metrics.leads ?? 0;
    const hires = metrics.hires ?? 0;
    const loaded = metrics.loaded ?? 0;
    const rejected = metrics.rejected ?? 0;
    const pipeline = leads + rejected + hires;

    bucket.calls.push(metrics.calls_made ?? 0);
    bucket.minutes.push(metrics.minutes_on_call ?? 0);
    if (leads > 0) bucket.hireRates.push(hires / leads);
    if (hires > 0) bucket.loadedRates.push(loaded / hires);
    if (pipeline > 0) bucket.rejectRates.push(rejected / pipeline);

    buckets.set(key, bucket);
  }

  const stats = new Map<string, CohortStats>();
  for (const [key, bucket] of buckets) {
    stats.set(key, {
      medianCalls: median(bucket.calls) || 1,
      medianMinutes: median(bucket.minutes) || 1,
      medianHireRate: median(bucket.hireRates) || 0.08,
      medianLoadedRate: median(bucket.loadedRates) || 0.5,
      medianRejectRate: median(bucket.rejectRates) || 0.25,
    });
  }

  return stats;
}

function scoreActivity(
  employee: Employee,
  cohort: CohortStats,
  ramp: number,
): number {
  const metrics = employee.metrics;
  const calls = metrics?.calls_made ?? 0;
  const minutes = metrics?.minutes_on_call ?? 0;
  const expectedCalls = cohort.medianCalls * ramp;
  const expectedMinutes = cohort.medianMinutes * ramp;

  const callRatio = expectedCalls > 0 ? calls / expectedCalls : 0;
  const minuteRatio = expectedMinutes > 0 ? minutes / expectedMinutes : 0;
  let score = clamp((callRatio * 50 + minuteRatio * 50));

  const lateCount = employee.attendance?.late_count ?? 0;
  const noShowCount = employee.attendance?.no_show_count ?? 0;
  score -= Math.min(25, lateCount * 2 + noShowCount * 6);

  return clamp(score);
}

function scoreConversion(
  employee: Employee,
  cohort: CohortStats,
): { score: number; hireRate: number; loadedRate: number } {
  const metrics = employee.metrics;
  const leads = metrics?.leads ?? 0;
  const hires = metrics?.hires ?? 0;
  const loaded = metrics?.loaded ?? 0;

  const hireRate = leads > 0 ? hires / leads : 0;
  const loadedRate = hires > 0 ? loaded / hires : 0;

  const hireRatio =
    cohort.medianHireRate > 0
      ? hireRate / cohort.medianHireRate
      : hires > 0
        ? 1.2
        : 0;
  const loadedRatio =
    cohort.medianLoadedRate > 0
      ? loadedRate / cohort.medianLoadedRate
      : loaded > 0
        ? 1.2
        : 0;

  const score = clamp(hireRatio * 55 + loadedRatio * 45);
  return { score, hireRate, loadedRate };
}

function scoreQuality(employee: Employee, cohort: CohortStats): number {
  const metrics = employee.metrics;
  const leads = metrics?.leads ?? 0;
  const rejected = metrics?.rejected ?? 0;
  const hires = metrics?.hires ?? 0;
  const pipeline = leads + rejected + hires;

  if (pipeline === 0) return 65;
  const rejectRate = rejected / pipeline;
  const benchmark = Math.max(cohort.medianRejectRate, 0.08);
  const ratio = rejectRate / benchmark;
  return clamp(100 - ratio * 45);
}

function scoreKnowledge(
  employee: Employee,
  activity: number,
  conversion: number,
  quality: number,
): number {
  const metrics = employee.metrics;
  const missed = metrics?.missed_calls ?? 0;
  const calls = metrics?.calls_made ?? 0;
  const missedRate = calls > 0 ? missed / calls : 0;

  let score = 72;
  if (activity >= 50 && conversion < 45 && quality >= 48) score = 38;
  else if (activity >= 50 && conversion < 55) score = 52;
  if (missedRate > 0.18) score -= 12;
  return clamp(score);
}

function deriveTags(
  activity: number,
  conversion: number,
  quality: number,
  knowledge: number,
): DiagnosisTag[] {
  const tags: DiagnosisTag[] = [];

  if (activity < 42 && conversion < 48) tags.push("lazy");
  if (activity >= 45 && quality < 46) tags.push("lead_quality");
  if (
    activity >= 45 &&
    conversion < 48 &&
    quality >= 46 &&
    knowledge < 58
  ) {
    tags.push("knowledge");
  }

  return tags;
}

function deriveTier(
  pi: number,
  tenure: number,
  calls: number,
  leads: number,
  confidence: RankConfidence,
): HrPerformanceTier {
  if (tenure < 30 || (calls < MIN_CALLS_FOR_RANK && leads < MIN_LEADS_FOR_RANK)) {
    return "provisional";
  }
  if (pi < 38 && tenure >= 90) return "at_risk";
  if (pi >= 82 && confidence !== "low") return "distinguished";
  if (pi >= 68) return "advanced";
  if (pi >= 52) return "proficient";
  return "developing";
}

function deriveConfidence(calls: number, leads: number): RankConfidence {
  if (calls < 40 || leads < 8) return "low";
  if (calls < 80 || leads < 15) return "medium";
  return "high";
}

function buildPlans(
  employee: Employee,
  tags: DiagnosisTag[],
  cohort: CohortStats,
  ramp: number,
): PerformanceTarget[] {
  const metrics = employee.metrics;
  const calls = metrics?.calls_made ?? 0;
  const minutes = metrics?.minutes_on_call ?? 0;
  const leads = metrics?.leads ?? 0;
  const hires = metrics?.hires ?? 0;
  const loaded = metrics?.loaded ?? 0;
  const rejected = metrics?.rejected ?? 0;
  const followUp = metrics?.follow_up ?? 0;
  const pipeline = leads + rejected + hires;
  const rejectRate = pipeline > 0 ? rejected / pipeline : 0;
  const hireRate = leads > 0 ? hires / leads : 0;

  const primary = tags[0];
  const expectedCalls = Math.round(cohort.medianCalls * ramp * 1.15);
  const expectedMinutes = Math.round(cohort.medianMinutes * ramp * 1.15);
  const targetHireRate = Math.max(
    cohort.medianHireRate * 1.1,
    hireRate * 1.15,
    0.05,
  );
  const targetRejectDrop = Math.max(0.03, rejectRate * 0.85);

  if (primary === "lazy") {
    return [
      {
        horizon: "30d",
        label: "Raise weekly calls to cohort norm",
        metricKey: "calls_made",
        current: calls,
        target: Math.max(expectedCalls, calls + 20),
        unit: "calls",
      },
      {
        horizon: "60d",
        label: "Talk minutes at expected band",
        metricKey: "minutes_on_call",
        current: minutes,
        target: Math.max(expectedMinutes, minutes + 60),
        unit: "min",
      },
      {
        horizon: "90d",
        label: "First hire at cohort conversion",
        metricKey: "hires",
        current: hires,
        target: Math.max(hires + 1, Math.ceil(leads * targetHireRate)),
        unit: "hires",
      },
    ];
  }

  if (primary === "lead_quality") {
    return [
      {
        horizon: "30d",
        label: "Cut reject / N/A share",
        metricKey: "reject_rate",
        current: Math.round(rejectRate * 100),
        target: Math.round((rejectRate - targetRejectDrop) * 100),
        unit: "%",
      },
      {
        horizon: "60d",
        label: "Follow-up completion",
        metricKey: "follow_up",
        current: followUp,
        target: Math.max(followUp + 5, Math.round(leads * 0.6)),
        unit: "follow-ups",
      },
      {
        horizon: "90d",
        label: "Loaded drivers from cleaner pipeline",
        metricKey: "loaded",
        current: loaded,
        target: Math.max(loaded + 1, hires),
        unit: "loaded",
      },
    ];
  }

  if (primary === "knowledge") {
    return [
      {
        horizon: "30d",
        label: "Coached calls (manager + AI review)",
        metricKey: "coached_calls",
        current: 0,
        target: 6,
        unit: "sessions",
      },
      {
        horizon: "60d",
        label: "Hire rate lift vs current",
        metricKey: "hire_rate",
        current: Math.round(hireRate * 100),
        target: Math.round(targetHireRate * 100),
        unit: "%",
      },
      {
        horizon: "90d",
        label: "Reach Advanced performance band",
        metricKey: "performance_index",
        current: 0,
        target: 68,
        unit: "PI",
      },
    ];
  }

  return [
    {
      horizon: "30d",
      label: "Maintain activity baseline",
      metricKey: "calls_made",
      current: calls,
      target: Math.max(calls, expectedCalls),
      unit: "calls",
    },
    {
      horizon: "60d",
      label: "Improve hire efficiency",
      metricKey: "hire_rate",
      current: Math.round(hireRate * 100),
      target: Math.round(Math.max(targetHireRate, hireRate * 100) * 1.05),
      unit: "%",
    },
    {
      horizon: "90d",
      label: "Reach Advanced tier",
      metricKey: "performance_index",
      current: 0,
      target: 68,
      unit: "PI",
    },
  ];
}

export function rankEmployee(
  employee: Employee,
  cohortStats: Map<string, CohortStats>,
): EmployeePerformanceProfile {
  const days = tenureDays(employee.joined_at);
  const band = tenureBand(days);
  const key = cohortKey(employee, band);
  const cohort = cohortStats.get(key) ?? {
    medianCalls: 80,
    medianMinutes: 400,
    medianHireRate: 0.08,
    medianLoadedRate: 0.55,
    medianRejectRate: 0.22,
  };
  const ramp = rampFactor(days);

  const metrics = employee.metrics;
  const calls = metrics?.calls_made ?? 0;
  const minutes = metrics?.minutes_on_call ?? 0;
  const leads = metrics?.leads ?? 0;

  const activity = scoreActivity(employee, cohort, ramp);
  const { score: conversion, hireRate, loadedRate } = scoreConversion(
    employee,
    cohort,
  );
  const quality = scoreQuality(employee, cohort);
  const knowledge = scoreKnowledge(employee, activity, conversion, quality);

  const performanceIndex = Math.round(
    activity * 0.25 +
      conversion * 0.4 +
      quality * 0.25 +
      knowledge * 0.1,
  );

  const confidence = deriveConfidence(calls, leads);
  const tier = deriveTier(performanceIndex, days, calls, leads, confidence);
  const tags = deriveTags(activity, conversion, quality, knowledge);

  const expectedCalls = cohort.medianCalls * ramp;
  const expectedMinutes = cohort.medianMinutes * ramp;

  const pipeline =
    (metrics?.leads ?? 0) +
    (metrics?.rejected ?? 0) +
    (metrics?.hires ?? 0);
  const rejectRate =
    pipeline > 0 ? (metrics?.rejected ?? 0) / pipeline : 0;

  return {
    employeeId: employee.id,
    tier,
    performanceIndex,
    confidence,
    tenureDays: days,
    tenureBand: band,
    cohortKey: key,
    scores: { activity, conversion, quality, knowledge },
    ratios: {
      callsVsExpected: expectedCalls > 0 ? calls / expectedCalls : 0,
      minutesVsExpected: expectedMinutes > 0 ? minutes / expectedMinutes : 0,
      hireRateVsExpected:
        cohort.medianHireRate > 0 ? hireRate / cohort.medianHireRate : 0,
      loadedRateVsExpected:
        cohort.medianLoadedRate > 0 ? loadedRate / cohort.medianLoadedRate : 0,
    },
    primaryTag: tags[0] ?? null,
    tags,
    plans: buildPlans(employee, tags, cohort, ramp),
    hireRate,
    loadedRate,
    rejectRate,
  };
}

export function rankEmployees(
  employees: Employee[],
): Map<number, EmployeePerformanceProfile> {
  const cohortStats = buildCohortStats(employees);
  const rankings = new Map<number, EmployeePerformanceProfile>();

  for (const employee of employees) {
    rankings.set(employee.id, rankEmployee(employee, cohortStats));
  }

  return rankings;
}

export function sortedByPerformance(
  employees: Employee[],
  rankings: Map<number, EmployeePerformanceProfile>,
): Employee[] {
  return [...employees].sort((a, b) => {
    const ra = rankings.get(a.id)?.performanceIndex ?? 0;
    const rb = rankings.get(b.id)?.performanceIndex ?? 0;
    return rb - ra;
  });
}

export function tierSortWeight(tier: HrPerformanceTier): number {
  const order: Record<HrPerformanceTier, number> = {
    distinguished: 6,
    advanced: 5,
    proficient: 4,
    developing: 3,
    provisional: 2,
    at_risk: 1,
  };
  return order[tier];
}
