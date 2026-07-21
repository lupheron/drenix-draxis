import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AccessProfile } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useAccessProfiles() {
  return useQuery({
    queryKey: queryKeys.accessProfiles,
    queryFn: () => api<{ data: AccessProfile[] }>("/access-profiles"),
  });
}
