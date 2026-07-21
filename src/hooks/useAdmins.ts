import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Admin } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useAdmins() {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.admins,
    queryFn: () => api<{ data: Admin[] }>("/admins", {}, token),
    enabled: Boolean(token) && authStorage.isSuperAdmin(),
  });
}
