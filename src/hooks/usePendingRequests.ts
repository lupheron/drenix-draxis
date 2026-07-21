import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AccessRequest } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function usePendingRequests() {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.pendingRequests,
    queryFn: () =>
      api<{ data: AccessRequest[] }>("/access-requests/pending", {}, token),
    enabled: Boolean(token) && authStorage.isAdmin(),
  });
}
