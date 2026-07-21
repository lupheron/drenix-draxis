import { useQuery } from "@tanstack/react-query";
import {
  fetchCompanyHrAnalytics,
  fetchDailyMetrics,
  fetchRingCentralCalls,
  fetchRingCentralOverview,
  fetchUser,
  fetchUsers,
} from "@/lib/api/employees";
import { authStorage } from "@/lib/auth-storage";
import type { CallType, CompanyCode, UsersListParams } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useEmployees(params?: UsersListParams) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => fetchUsers(params),
    enabled: Boolean(token),
    refetchInterval:
      params?.from && (params.department === "hr" || params.department === "safety")
        ? 45_000
        : false,
  });
}

export function useEmployee(id: number | string | null) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.user(id ?? ""),
    queryFn: () => fetchUser(id!),
    enabled: Boolean(token) && id !== null && id !== "",
  });
}

export function useDailyMetrics(
  userId: number | string | null,
  from: string,
  to: string,
  enabled = true,
) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.dailyMetrics(userId ?? "", from, to),
    queryFn: () => fetchDailyMetrics(userId!, from, to),
    enabled: Boolean(token) && Boolean(userId) && enabled && Boolean(from && to),
    refetchInterval: enabled ? 45_000 : false,
  });
}

export function useCompanyHrAnalytics(
  company: CompanyCode,
  from: string,
  to: string,
) {
  const token = authStorage.getToken();
  const isAdmin = authStorage.isAdmin();

  return useQuery({
    queryKey: queryKeys.companyHrAnalytics(company, from, to),
    queryFn: () => fetchCompanyHrAnalytics(company, from, to),
    enabled: Boolean(token) && isAdmin && Boolean(from && to),
    refetchInterval: 45_000,
  });
}

export function useRingCentralOverview(
  userId: number | string | null,
  from: string,
  to: string,
  enabled = true,
) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.ringCentral(userId ?? "", from, to),
    queryFn: () => fetchRingCentralOverview(userId!, from, to),
    enabled: Boolean(token) && Boolean(userId) && enabled && Boolean(from && to),
    refetchInterval: enabled ? 45_000 : false,
  });
}

export function useRingCentralCalls(
  userId: number | string | null,
  params: {
    from: string;
    to: string;
    type?: CallType | "";
    page?: number;
    per_page?: number;
  },
  enabled = true,
) {
  const token = authStorage.getToken();
  const type = params.type ?? "";
  const page = params.page ?? 1;

  return useQuery({
    queryKey: queryKeys.ringCentralCalls(
      userId ?? "",
      params.from,
      params.to,
      type,
      page,
    ),
    queryFn: () =>
      fetchRingCentralCalls(userId!, {
        from: params.from,
        to: params.to,
        type,
        page,
        per_page: params.per_page ?? 50,
      }),
    enabled:
      Boolean(token) &&
      Boolean(userId) &&
      enabled &&
      Boolean(params.from && params.to),
    refetchInterval: enabled ? 45_000 : false,
  });
}
