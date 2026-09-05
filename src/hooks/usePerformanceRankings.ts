import { useMemo } from "react";
import type { Employee } from "@/lib/types";
import type { EmployeePerformanceProfile } from "@/types/performance-ranking";
import { rankEmployees, sortedByPerformance } from "@/utils/performance-ranking";

export function usePerformanceRankings(employees: Employee[]) {
  const rankings = useMemo(
    () => rankEmployees(employees),
    [employees],
  );

  const rankedEmployees = useMemo(
    () => sortedByPerformance(employees, rankings),
    [employees, rankings],
  );

  const summary = useMemo(() => {
    let distinguished = 0;
    let advanced = 0;
    let atRisk = 0;
    let flagged = 0;

    for (const profile of rankings.values()) {
      if (profile.tier === "distinguished") distinguished += 1;
      if (profile.tier === "advanced") advanced += 1;
      if (profile.tier === "at_risk") atRisk += 1;
      if (profile.primaryTag) flagged += 1;
    }

    return { distinguished, advanced, atRisk, flagged, total: rankings.size };
  }, [rankings]);

  function getProfile(employeeId: number): EmployeePerformanceProfile | undefined {
    return rankings.get(employeeId);
  }

  return { rankings, rankedEmployees, summary, getProfile };
}
