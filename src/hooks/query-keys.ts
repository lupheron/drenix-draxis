import type { UsersListParams } from "@/lib/types";

export const queryKeys = {
  accessProfiles: ["access-profiles"] as const,
  pendingRequests: ["access-requests", "pending"] as const,
  acceptedRequests: ["access-requests", "accepted"] as const,
  admins: ["admins"] as const,
  adminSessions: (adminId?: number | null) =>
    ["admin-sessions", adminId ?? "all"] as const,
  adminMe: ["admin", "me"] as const,
  accessMe: ["access", "me"] as const,
  users: (params?: UsersListParams) => ["users", params ?? {}] as const,
  user: (id: number | string) => ["users", id] as const,
  dailyMetrics: (id: number | string, from: string, to: string) =>
    ["users", id, "metrics", "daily", from, to] as const,
  ringCentral: (id: number | string, from: string, to: string) =>
    ["users", id, "ringcentral", from, to] as const,
  ringCentralCalls: (
    id: number | string,
    from: string,
    to: string,
    type: string,
    page: number,
  ) => ["users", id, "ringcentral", "calls", from, to, type, page] as const,
  ringCentralConversations: (id: number | string, from: string, to: string) =>
    ["users", id, "ringcentral", "conversations", from, to] as const,
  ringCentralMessages: (
    id: number | string,
    from: string,
    to: string,
    conversationId: string,
    direction: string,
    page: number,
  ) =>
    [
      "users",
      id,
      "ringcentral",
      "messages",
      from,
      to,
      conversationId,
      direction,
      page,
    ] as const,
  companyHrAnalytics: (company: string, from: string, to: string) =>
    ["companies", company, "hr", "analytics", from, to] as const,
  driverLeadsSearch: (
    company: string,
    params: { name?: string; phone?: string; email?: string } | null,
  ) => ["driver-leads", "search", company, params ?? {}] as const,
  driverLeadsBrowse: (params: {
    company: string;
    status?: string;
    board?: string;
    page?: number;
    per_page?: number;
  }) => ["driver-leads", "browse", params] as const,
};
