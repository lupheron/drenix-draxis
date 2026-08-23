import { useQuery } from "@tanstack/react-query";
import type { CompanyCode } from "@/lib/types";
import type { AttendanceFetchResult } from "@/types/attendance";

export function useAttendance(
  company: CompanyCode,
  from: string,
  to: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["attendance", company, from, to],
    queryFn: async (): Promise<AttendanceFetchResult> => {
      const params = new URLSearchParams({
        company,
        from,
        to,
      });
      const response = await fetch(`/api/attendance?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Attendance request failed (${response.status})`);
      }
      return (await response.json()) as AttendanceFetchResult;
    },
    enabled: enabled && Boolean(from && to),
  });
}
