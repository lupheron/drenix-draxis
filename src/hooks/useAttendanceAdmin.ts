import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAttendanceRequest,
  fetchAttendanceDays,
  fetchAttendanceEmployeeDays,
  fetchAttendanceRequests,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  rejectAttendanceRequest,
  updateAttendanceDay,
} from "@/lib/api/attendance-admin";
import { authStorage } from "@/lib/auth-storage";
import type {
  AttendanceDayStatus,
  AttendanceDaysListParams,
  AttendanceRequestStatus,
} from "@/lib/types";

export function useAttendanceDays(params: AttendanceDaysListParams, enabled = true) {
  return useQuery({
    queryKey: ["attendance", "days", params],
    queryFn: () => fetchAttendanceDays(params),
    enabled: enabled && Boolean(params.from && params.to),
  });
}

export function useAttendanceEmployeeDays(
  employeeId: number | string | null,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ["attendance", "employee", employeeId, from, to],
    queryFn: () => fetchAttendanceEmployeeDays(employeeId!, from, to),
    enabled: Boolean(employeeId && from && to),
  });
}

export function useUpdateAttendanceDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: {
        status?: AttendanceDayStatus;
        admin_note?: string;
        late_minutes?: number;
        no_show?: boolean;
      };
    }) => updateAttendanceDay(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAttendanceRequests(
  status: AttendanceRequestStatus | "pending" | "" = "pending",
  enabled = true,
) {
  return useQuery({
    queryKey: ["attendance", "requests", status],
    queryFn: () => fetchAttendanceRequests(status),
    enabled: enabled && authStorage.canAccessAttendance(),
  });
}

export function useApproveAttendanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      approveAttendanceRequest(id, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRejectAttendanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      rejectAttendanceRequest(id, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAdminNotifications(unreadOnly = false, enabled = true) {
  return useQuery({
    queryKey: ["notifications", unreadOnly ? "unread" : "all"],
    queryFn: () => fetchNotifications({ unreadOnly }),
    enabled: enabled && authStorage.canAccessAttendance(),
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  const query = useAdminNotifications(true, enabled);
  return {
    ...query,
    count: query.data?.length ?? 0,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
