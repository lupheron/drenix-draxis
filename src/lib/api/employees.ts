import { apiRequest, ApiError } from "@/lib/api/client";
import {
  mapApiEmployee,
  normalizeDailyMetric,
  normalizeEmployeePayload,
} from "@/lib/api/employee-payload";
import type {
  CallType,
  CompanyCode,
  CompanyHrAnalytics,
  DailyMetric,
  Employee,
  EmployeePayload,
  RingCentralCallsPage,
  RingCentralOverview,
  UsersListParams,
} from "@/lib/types";

function buildUsersQuery(params?: UsersListParams): string {
  const searchParams = new URLSearchParams();

  if (params?.company) searchParams.set("company", params.company);
  if (params?.department && params.department !== "all") {
    searchParams.set("department", params.department);
  }
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function metricNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCallType(value: unknown): CallType {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (
    raw === "outbound" ||
    raw === "inbound" ||
    raw === "missed" ||
    raw === "voicemail" ||
    raw === "other"
  ) {
    return raw;
  }
  return "other";
}

export async function fetchUsers(
  params?: UsersListParams,
): Promise<Employee[]> {
  const response = await apiRequest<{ data: Record<string, unknown>[] }>(
    `/users${buildUsersQuery(params)}`,
  );
  return response.data.map((row) => mapApiEmployee(row));
}

export async function fetchUser(id: number | string): Promise<Employee> {
  const response = await apiRequest<{ data: Record<string, unknown> }>(
    `/users/${id}`,
  );
  return mapApiEmployee(response.data);
}

export async function createEmployee(
  payload: EmployeePayload,
): Promise<Employee> {
  const body = normalizeEmployeePayload(payload);
  const response = await apiRequest<{ data: Record<string, unknown> }>(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return mapApiEmployee(response.data);
}

export async function updateEmployee(
  id: number | string,
  payload: EmployeePayload,
): Promise<Employee> {
  const body = normalizeEmployeePayload(payload);
  const response = await apiRequest<{ data: Record<string, unknown> }>(
    `/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
  return mapApiEmployee(response.data);
}

export async function deleteEmployee(id: number | string): Promise<void> {
  await apiRequest<void>(`/users/${id}`, { method: "DELETE" });
}

export async function fetchDailyMetrics(
  userId: number | string,
  from: string,
  to: string,
): Promise<DailyMetric[]> {
  const response = await apiRequest<{ data: Record<string, unknown>[] }>(
    `/users/${userId}/metrics/daily?from=${from}&to=${to}`,
  );
  return response.data.map((row) => normalizeDailyMetric(row));
}

export async function fetchCompanyHrAnalytics(
  company: CompanyCode,
  from: string,
  to: string,
): Promise<CompanyHrAnalytics> {
  const response = await apiRequest<{
    data: CompanyHrAnalytics & {
      by_employee?: Record<string, unknown>[];
    };
  }>(`/companies/${company}/hr/analytics?from=${from}&to=${to}`);

  return {
    ...response.data,
    minutes_on_call: metricNumber(response.data.minutes_on_call),
    calls_made: metricNumber(response.data.calls_made),
    outbound_calls: metricNumber(response.data.outbound_calls),
    inbound_calls: metricNumber(response.data.inbound_calls),
    missed_calls: metricNumber(response.data.missed_calls),
    voicemail_calls: metricNumber(response.data.voicemail_calls),
    other_calls: metricNumber(response.data.other_calls),
    outbound_minutes: metricNumber(response.data.outbound_minutes),
    inbound_minutes: metricNumber(response.data.inbound_minutes),
    lates: metricNumber(response.data.lates),
    leads: metricNumber(response.data.leads),
    follow_up: metricNumber(response.data.follow_up),
    hires: metricNumber(response.data.hires),
    loaded: metricNumber(response.data.loaded),
    rejected: metricNumber(response.data.rejected),
    by_employee: (response.data.by_employee ?? []).map((row) =>
      mapApiEmployee(row),
    ),
  };
}

export async function fetchRingCentralOverview(
  userId: number | string,
  from: string,
  to: string,
): Promise<RingCentralOverview> {
  const response = await apiRequest<{ data: RingCentralOverview }>(
    `/users/${userId}/ringcentral?from=${from}&to=${to}`,
  );
  const data = response.data;
  const summary = data.summary;

  return {
    user_id: Number(data.user_id),
    from: String(data.from).slice(0, 10),
    to: String(data.to).slice(0, 10),
    summary: {
      total_calls: metricNumber(summary?.total_calls),
      outbound: metricNumber(summary?.outbound),
      inbound: metricNumber(summary?.inbound),
      missed: metricNumber(summary?.missed),
      voicemail: metricNumber(summary?.voicemail),
      other: metricNumber(summary?.other),
      minutes_total: metricNumber(summary?.minutes_total),
      minutes_outbound: metricNumber(summary?.minutes_outbound),
      minutes_inbound: metricNumber(summary?.minutes_inbound),
    },
    daily: (data.daily ?? []).map((row) => ({
      total_calls: metricNumber(row.total_calls),
      outbound: metricNumber(row.outbound),
      inbound: metricNumber(row.inbound),
      missed: metricNumber(row.missed),
      voicemail: metricNumber(row.voicemail),
      other: metricNumber(row.other),
      minutes_total: metricNumber(row.minutes_total),
      minutes_outbound: metricNumber(row.minutes_outbound),
      minutes_inbound: metricNumber(row.minutes_inbound),
      date: row.date ? String(row.date).slice(0, 10) : null,
    })),
  };
}

export async function fetchRingCentralCalls(
  userId: number | string,
  params: {
    from: string;
    to: string;
    type?: CallType | "";
    page?: number;
    per_page?: number;
  },
): Promise<RingCentralCallsPage> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.type) search.set("type", params.type);
  search.set("page", String(params.page ?? 1));
  search.set("per_page", String(params.per_page ?? 50));

  const response = await apiRequest<{
    data: Array<{
      id: number | string;
      external_id?: string;
      started_at?: string;
      duration_seconds?: number;
      duration_minutes?: number;
      direction?: string | null;
      result?: string | null;
      call_type?: string;
      action?: string | null;
    }>;
    meta?: RingCentralCallsPage["meta"];
  }>(`/users/${userId}/ringcentral/calls?${search.toString()}`);

  const meta = response.meta ?? {
    total: response.data.length,
    page: params.page ?? 1,
    per_page: params.per_page ?? 50,
    from: params.from,
    to: params.to,
    type: params.type || null,
  };

  return {
    data: (response.data ?? []).map((row) => ({
      id: Number(row.id),
      external_id: String(row.external_id ?? ""),
      started_at: String(row.started_at ?? ""),
      duration_seconds: metricNumber(row.duration_seconds),
      duration_minutes: metricNumber(row.duration_minutes),
      direction: row.direction == null ? null : String(row.direction),
      result: row.result == null ? null : String(row.result),
      call_type: normalizeCallType(row.call_type),
      action: row.action == null ? null : String(row.action),
    })),
    meta: {
      total: metricNumber(meta.total),
      page: metricNumber(meta.page) || 1,
      per_page: metricNumber(meta.per_page) || 50,
      from: String(meta.from ?? params.from).slice(0, 10),
      to: String(meta.to ?? params.to).slice(0, 10),
      type: meta.type ? normalizeCallType(meta.type) : null,
    },
  };
}

export { ApiError };
