import type {
  Employee,
  EmployeeWithPerformance,
  PerformanceMetrics,
  PerformancePeriod,
  StaffDailyLog,
} from "@/types/staff";
import { sumChargesInRange } from "@/utils/charges";

const PERIOD_DAYS: Record<Exclude<PerformancePeriod, "custom">, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

export function calculatePerformanceScore(metrics: {
  callsMade: number;
  recordingsCount: number;
  hires: number;
  minutesOnCall: number;
  leads: number;
  hired: number;
}): number {
  const raw =
    metrics.callsMade * 1.2 +
    metrics.recordingsCount * 0.8 +
    metrics.hires * 25 +
    metrics.minutesOnCall * 0.15 +
    metrics.leads * 0.5 +
    metrics.hired * 20;

  return Math.min(100, Math.round(raw / 10));
}

function aggregateLogs(
  logs: StaffDailyLog[],
  chargeTotal: number,
): PerformanceMetrics {
  const totals = logs.reduce(
    (acc, log) => ({
      callsMade: acc.callsMade + log.callsMade,
      recordingsCount: acc.recordingsCount + log.recordingsCount,
      hires: acc.hires + log.hires,
      minutesOnCall: acc.minutesOnCall + log.minutesOnCall,
      hoursWorked: acc.hoursWorked + log.hoursWorked,
      leads: acc.leads + log.leads,
      followUp: acc.followUp + log.followUp,
      reject: acc.reject + log.reject,
      hired: acc.hired + log.hired,
      onProcess: acc.onProcess + log.onProcess,
      breakWarnings: acc.breakWarnings + log.breakWarnings,
    }),
    {
      callsMade: 0,
      recordingsCount: 0,
      hires: 0,
      minutesOnCall: 0,
      hoursWorked: 0,
      leads: 0,
      followUp: 0,
      reject: 0,
      hired: 0,
      onProcess: 0,
      breakWarnings: 0,
    },
  );

  const hireRate =
    totals.leads > 0
      ? Math.round((totals.hired / totals.leads) * 1000) / 10
      : 0;

  const latestLog = logs[logs.length - 1];

  return {
    callsMade: totals.callsMade,
    recordingsCount: totals.recordingsCount,
    hires: totals.hires,
    minutesSpoken: totals.minutesOnCall,
    hoursWorked: Math.round(totals.hoursWorked * 10) / 10,
    leads: totals.leads,
    followUp: totals.followUp,
    reject: totals.reject,
    hired: totals.hired,
    onProcess: totals.onProcess,
    breakWarnings: totals.breakWarnings,
    charges: chargeTotal,
    hireRate,
    attendance: latestLog?.attendance ?? "on_time",
    score: calculatePerformanceScore({
      callsMade: totals.callsMade,
      recordingsCount: totals.recordingsCount,
      hires: totals.hires,
      minutesOnCall: totals.minutesOnCall,
      leads: totals.leads,
      hired: totals.hired,
    }),
  };
}

export function getPeriodDateRange(
  period: Exclude<PerformancePeriod, "custom">,
  referenceDate = new Date(),
): { from: string; to: string } {
  const to = referenceDate.toISOString().slice(0, 10);
  const fromDate = new Date(referenceDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - (PERIOD_DAYS[period] - 1));

  return {
    from: fromDate.toISOString().slice(0, 10),
    to,
  };
}

export function filterLogsByDateRange(
  logs: StaffDailyLog[],
  from: string,
  to: string,
): StaffDailyLog[] {
  return logs
    .filter((log) => log.date >= from && log.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getEmployeePerformance(
  employee: Employee,
  period: PerformancePeriod,
  customRange?: { from: string; to: string },
): PerformanceMetrics {
  let from: string;
  let to: string;

  if (period === "custom") {
    if (!customRange?.from || !customRange?.to) {
      return {
        callsMade: 0,
        recordingsCount: 0,
        hires: 0,
        minutesSpoken: 0,
        hoursWorked: 0,
        leads: 0,
        followUp: 0,
        reject: 0,
        hired: 0,
        onProcess: 0,
        breakWarnings: 0,
        charges: 0,
        hireRate: 0,
        attendance: "on_time",
        score: 0,
      };
    }
    from = customRange.from;
    to = customRange.to;
  } else {
    const range = getPeriodDateRange(period);
    from = range.from;
    to = range.to;
  }

  const logs = filterLogsByDateRange(employee.dailyLogs, from, to);
  const chargeTotal = sumChargesInRange(employee.chargeEntries, from, to);

  return aggregateLogs(logs, chargeTotal);
}

export function rankEmployees(
  employees: Employee[],
  period: PerformancePeriod,
  departmentId: string,
  customRange?: { from: string; to: string },
): EmployeeWithPerformance[] {
  const filtered =
    departmentId === "all"
      ? employees
      : employees.filter((employee) => employee.department === departmentId);

  const withPerformance = filtered
    .map((employee) => ({
      ...employee,
      performance: getEmployeePerformance(employee, period, customRange),
    }))
    .sort((a, b) => b.performance.score - a.performance.score);

  return withPerformance.map((employee, index) => ({
    ...employee,
    rank: index + 1,
  }));
}

export const GRADE_ORDER: Record<string, number> = {
  "A+": 13,
  A: 12,
  "A-": 11,
  "B+": 10,
  B: 9,
  "B-": 8,
  "C+": 7,
  C: 6,
  "C-": 5,
  "D+": 4,
  D: 3,
  "D-": 2,
  F: 1,
};
