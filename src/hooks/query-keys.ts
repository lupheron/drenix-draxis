import type { UsersListParams } from "@/lib/types";

export const queryKeys = {
  accessProfiles: ["access-profiles"] as const,
  pendingRequests: ["access-requests", "pending"] as const,
  acceptedRequests: ["access-requests", "accepted"] as const,
  admins: ["admins"] as const,
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
  companyHrAnalytics: (company: string, from: string, to: string) =>
    ["companies", company, "hr", "analytics", from, to] as const,
};
