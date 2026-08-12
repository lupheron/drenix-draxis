import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchCompanyHrAnalytics,
  fetchDailyMetrics,
  fetchRingCentralCalls,
  fetchRingCentralConversations,
  fetchRingCentralMessages,
  fetchRingCentralOverview,
  fetchUser,
  fetchUsers,
} from "@/lib/api/employees";
import { authStorage } from "@/lib/auth-storage";
import type {
  CallType,
  CompanyCode,
  Employee,
  MessageDirection,
  UsersListParams,
} from "@/lib/types";
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

export function useRingCentralConversations(
  userId: number | string | null,
  from: string,
  to: string,
  enabled = true,
) {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: queryKeys.ringCentralConversations(userId ?? "", from, to),
    queryFn: () => fetchRingCentralConversations(userId!, from, to),
    enabled: Boolean(token) && Boolean(userId) && enabled && Boolean(from && to),
    refetchInterval: enabled ? 45_000 : false,
  });
}

export function useRingCentralMessages(
  userId: number | string | null,
  params: {
    from: string;
    to: string;
    conversation_id?: string;
    direction?: MessageDirection | "";
    page?: number;
    per_page?: number;
  },
  enabled = true,
) {
  const token = authStorage.getToken();
  const conversationId = params.conversation_id ?? "";
  const direction = params.direction ?? "";
  const page = params.page ?? 1;

  return useQuery({
    queryKey: queryKeys.ringCentralMessages(
      userId ?? "",
      params.from,
      params.to,
      conversationId,
      direction,
      page,
    ),
    queryFn: () =>
      fetchRingCentralMessages(userId!, {
        from: params.from,
        to: params.to,
        conversation_id: conversationId || undefined,
        direction,
        page,
        per_page: params.per_page ?? 80,
      }),
    enabled:
      Boolean(token) &&
      Boolean(userId) &&
      enabled &&
      Boolean(params.from && params.to) &&
      Boolean(conversationId),
    refetchInterval: enabled ? 45_000 : false,
  });
}

export type EmployeeTextStats = {
  userId: number;
  total_messages: number;
  inbound: number;
  outbound: number;
  conversations_count: number;
};

/** Load SMS summaries for a company team (falls back when metrics lack text fields). */
export function useEmployeesRingCentralTexts(
  employees: Employee[],
  from: string,
  to: string,
  enabled = true,
) {
  const token = authStorage.getToken();
  const hasMetricTexts = employees.some(
    (employee) => (employee.metrics?.messages_total ?? 0) > 0,
  );

  const queries = useQueries({
    queries: employees.map((employee) => ({
      queryKey: queryKeys.ringCentralConversations(employee.id, from, to),
      queryFn: () => fetchRingCentralConversations(employee.id, from, to),
      enabled:
        Boolean(token) &&
        enabled &&
        !hasMetricTexts &&
        Boolean(from && to) &&
        employees.length > 0,
      refetchInterval: enabled && !hasMetricTexts ? 45_000 : false,
    })),
  });

  const fromMetrics: EmployeeTextStats[] = employees.map((employee) => ({
    userId: employee.id,
    total_messages: employee.metrics?.messages_total ?? 0,
    inbound: employee.metrics?.messages_inbound ?? 0,
    outbound: employee.metrics?.messages_outbound ?? 0,
    conversations_count: employee.metrics?.conversations_count ?? 0,
  }));

  if (hasMetricTexts) {
    return {
      byEmployee: fromMetrics,
      isLoading: false,
      isError: false,
      source: "metrics" as const,
    };
  }

  const byEmployee: EmployeeTextStats[] = employees.map((employee, index) => {
    const result = queries[index];
    const summary = result?.data?.summary;
    return {
      userId: employee.id,
      total_messages: summary?.total_messages ?? 0,
      inbound: summary?.inbound ?? 0,
      outbound: summary?.outbound ?? 0,
      conversations_count: summary?.conversations_count ?? 0,
    };
  });

  return {
    byEmployee,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    source: "conversations" as const,
  };
}

export type DailyTextPoint = {
  date: string;
  sent: number;
  received: number;
  total: number;
};

/** Daily SMS totals for one person (loads conversations → messages, buckets by day). */
export function usePersonDailyTexts(
  userId: number | string | null,
  from: string,
  to: string,
  enabled = true,
) {
  const token = authStorage.getToken();
  const conversations = useRingCentralConversations(
    userId,
    from,
    to,
    enabled && Boolean(userId),
  );

  const conversationRows = conversations.data?.data ?? [];

  const messageQueries = useQueries({
    queries: conversationRows.map((conversation) => ({
      queryKey: queryKeys.ringCentralMessages(
        userId ?? "",
        from,
        to,
        conversation.id,
        "",
        1,
      ),
      queryFn: () =>
        fetchRingCentralMessages(userId!, {
          from,
          to,
          conversation_id: conversation.id,
          page: 1,
          per_page: 200,
        }),
      enabled:
        Boolean(token) &&
        enabled &&
        Boolean(userId) &&
        Boolean(from && to) &&
        !conversations.isLoading &&
        conversationRows.length > 0,
    })),
  });

  const daily = useMemo(() => {
    const byDate = new Map<string, { sent: number; received: number }>();

    for (const query of messageQueries) {
      for (const message of query.data?.data ?? []) {
        const date = String(message.sent_at ?? "").slice(0, 10);
        if (!date) continue;
        const row = byDate.get(date) ?? { sent: 0, received: 0 };
        if (message.direction === "outbound") row.sent += 1;
        else row.received += 1;
        byDate.set(date, row);
      }
    }

    return Array.from(byDate.entries())
      .map(([date, counts]) => ({
        date,
        sent: counts.sent,
        received: counts.received,
        total: counts.sent + counts.received,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // dataUpdatedAt keeps bucket stable until fetches settle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageQueries.map((query) => query.dataUpdatedAt).join("|")]);

  const summary = conversations.data?.summary;

  return {
    daily,
    summary,
    isLoading:
      conversations.isLoading ||
      (conversationRows.length > 0 &&
        messageQueries.some((query) => query.isLoading)),
    isError: conversations.isError,
  };
}
