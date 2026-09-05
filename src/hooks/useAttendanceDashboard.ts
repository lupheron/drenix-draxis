import { useQueries } from "@tanstack/react-query";
import { fetchAttendanceDays } from "@/lib/api/attendance-admin";
import { COMPANY_CODES } from "@/constants/companies";
import type { CompanyCode } from "@/lib/types";
import {
  summarizeAttendanceDays,
  type AttendanceSummaryStats,
} from "@/utils/attendance-display";
import { getDateRangeForPreset } from "@/utils/date-ranges";

export type AttendancePeriodKey = "today" | "week" | "month" | "custom";

export type AttendancePeriodDef = {
  key: AttendancePeriodKey;
  label: string;
  from: string;
  to: string;
};

export type CompanyAttendanceSnapshot = {
  company: CompanyCode;
  period: AttendancePeriodKey;
  stats: AttendanceSummaryStats;
  isLoading: boolean;
  isError: boolean;
};

function periodDefs(customFrom: string, customTo: string): AttendancePeriodDef[] {
  return [
    { key: "today", label: "Today", ...getDateRangeForPreset("day") },
    { key: "week", label: "This week", ...getDateRangeForPreset("week") },
    { key: "month", label: "This month", ...getDateRangeForPreset("month") },
    { key: "custom", label: "Custom range", from: customFrom, to: customTo },
  ];
}

export function useAttendanceDashboard(customFrom: string, customTo: string) {
  const periods = periodDefs(customFrom, customTo);

  const queries = useQueries({
    queries: periods.flatMap((period) =>
      COMPANY_CODES.map((company) => ({
        queryKey: ["attendance", "dashboard", company, period.key, period.from, period.to],
        queryFn: () =>
          fetchAttendanceDays({
            company,
            from: period.from,
            to: period.to,
          }),
        staleTime: 60_000,
      })),
    ),
  });

  let qi = 0;
  const byPeriod = periods.map((period) => {
    const companies = COMPANY_CODES.map((company) => {
      const query = queries[qi++];
      const days = query.data ?? [];
      return {
        company,
        period: period.key,
        stats: summarizeAttendanceDays(days),
        isLoading: query.isLoading,
        isError: query.isError,
      } satisfies CompanyAttendanceSnapshot;
    });
    return { ...period, companies };
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.every((q) => q.isError);

  return { periods: byPeriod, isLoading, isError };
}
