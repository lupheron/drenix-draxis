import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AccessRequest } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useAcceptedUsers() {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.acceptedRequests,
    queryFn: () =>
      api<{ data: AccessRequest[] }>("/access-requests/accepted", {}, token),
    enabled: Boolean(token) && authStorage.isAdmin(),
  });
}
