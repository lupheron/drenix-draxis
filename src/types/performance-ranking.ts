/** HR recruiter performance tiers — not used for Safety or other departments yet. */
export type HrPerformanceTier =
  | "provisional"
  | "developing"
  | "proficient"
  | "advanced"
  | "distinguished"
  | "at_risk";

export type DiagnosisTag = "lazy" | "lead_quality" | "knowledge";

export type RankConfidence = "low" | "medium" | "high";

export type TenureBand = "0-30" | "31-90" | "91-180" | "180+";

export type PlanHorizon = "30d" | "60d" | "90d";

export type PerformanceTarget = {
  horizon: PlanHorizon;
  label: string;
  metricKey: string;
  current: number;
  target: number;
  unit: string;
};

export type PerformanceScores = {
  activity: number;
  conversion: number;
  quality: number;
  knowledge: number;
};

export type PerformanceRatios = {
  callsVsExpected: number;
  minutesVsExpected: number;
  hireRateVsExpected: number;
  loadedRateVsExpected: number;
};

export type EmployeePerformanceProfile = {
  employeeId: number;
  tier: HrPerformanceTier;
  performanceIndex: number;
  confidence: RankConfidence;
  tenureDays: number;
  tenureBand: TenureBand;
  cohortKey: string;
  scores: PerformanceScores;
  ratios: PerformanceRatios;
  primaryTag: DiagnosisTag | null;
  tags: DiagnosisTag[];
  plans: PerformanceTarget[];
  hireRate: number;
  loadedRate: number;
  rejectRate: number;
};
