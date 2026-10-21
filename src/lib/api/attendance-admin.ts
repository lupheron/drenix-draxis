import { apiRequest } from "@/lib/api/client";
import {
  normalizeAttendanceDay,
  normalizeAttendanceDays,
  normalizeAttendanceRequest,
  normalizeAttendanceRequests,
} from "@/lib/api/attendance-normalize";
import type {
  AttendanceDay,
  AttendanceDayStatus,
  AttendanceDaysListParams,
  AttendanceRequest,
  AttendanceRequestStatus,
  CompanyCode,
} from "@/lib/types";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchAttendanceDays(
  params: AttendanceDaysListParams,
): Promise<AttendanceDay[]> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/days${buildQuery({
      company: params.company,
      from: params.from,
      to: params.to,
      employee_id: params.employee_id,
      status: params.status,
    })}`,
  );
  return normalizeAttendanceDays(response.data);
}

export async function fetchAttendanceEmployeeDays(
  employeeId: number | string,
  from: string,
  to: string,
): Promise<AttendanceDay[]> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/employees/${employeeId}${buildQuery({ from, to })}`,
  );
  return normalizeAttendanceDays(response.data);
}

export async function updateAttendanceDay(
  id: number,
  body: {
    status?: AttendanceDayStatus;
    admin_note?: string;
    late_minutes?: number;
    no_show?: boolean;
  },
): Promise<AttendanceDay> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/days/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
  return normalizeAttendanceDay(response.data);
}

export async function fetchAttendanceRequests(
  status?: AttendanceRequestStatus | "pending" | "",
): Promise<AttendanceRequest[]> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/requests${buildQuery({ status: status ?? "pending" })}`,
  );
  return normalizeAttendanceRequests(response.data);
}

export async function approveAttendanceRequest(
  id: number,
  comment?: string,
): Promise<AttendanceRequest> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/requests/${id}/approve`,
    {
      method: "POST",
      body: JSON.stringify(comment ? { comment } : {}),
    },
  );
  return normalizeAttendanceRequest(response.data);
}

export async function rejectAttendanceRequest(
  id: number,
  comment?: string,
): Promise<AttendanceRequest> {
  const response = await apiRequest<{ data: unknown }>(
    `/attendance/requests/${id}/reject`,
    {
      method: "POST",
      body: JSON.stringify(comment ? { comment } : {}),
    },
  );
  return normalizeAttendanceRequest(response.data);
}

export type AdminNotification = {
  id: number;
  type: "attendance_request" | "access_request" | string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  meta?: Record<string, unknown>;
};

export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
}): Promise<AdminNotification[]> {
  const response = await apiRequest<{ data: AdminNotification[] }>(
    `/notifications${buildQuery({
      unread_only: options?.unreadOnly ? 1 : undefined,
    })}`,
  );
  return response.data ?? [];
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiRequest<void>(`/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<void>("/notifications/read-all", { method: "POST" });
}

export const ATTENDANCE_COMPANY_TABS: Record<CompanyCode, string> = {
  JM: "JM",
  BP: "BP",
  WF: "WF",
};

/** Drenix tab on sheet — optional cross-company view later */
export const ATTENDANCE_EXTRA_TABS = ["Drenix"] as const;
