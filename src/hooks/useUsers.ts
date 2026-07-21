import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Employee } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

type UsersParams = {
  department?: string;
};

export function useUsers(params?: UsersParams) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.department) {
        searchParams.set("department", params.department);
      }
      const query = searchParams.toString();
      return api<{ data: Employee[] }>(
        `/users${query ? `?${query}` : ""}`,
        {},
        token,
      );
    },
    enabled: Boolean(token),
  });
}

export function useUser(id: number | string | null) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.user(id ?? ""),
    queryFn: () => api<{ data: Employee }>(`/users/${id}`, {}, token),
    enabled: Boolean(token) && id !== null && id !== "",
  });
}
