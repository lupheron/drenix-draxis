import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Admin, AdminDeviceSession } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useAdminSessions(adminId?: number | null) {
  const token = authStorage.getToken();
  const query = adminId ? `?admin_id=${adminId}` : "";

  return useQuery({
    queryKey: queryKeys.adminSessions(adminId),
    queryFn: () =>
      api<{ data: AdminDeviceSession[] }>(
        `/admin-sessions${query}`,
        {},
        token,
      ),
    enabled: Boolean(token) && authStorage.isSuperAdmin(),
  });
}

function invalidateSessions(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
}

export function useRevokeAdminSession() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<{ message: string }>(
        `/admin-sessions/${id}`,
        { method: "DELETE" },
        token,
      ),
    onSuccess: () => invalidateSessions(queryClient),
  });
}

export function useRevokeMyOtherSessions() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<{ message: string; revoked: number }>(
        "/admin-sessions/revoke-others",
        { method: "POST" },
        token,
      ),
    onSuccess: () => invalidateSessions(queryClient),
  });
}

export function useRevokeAdminSessions() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: number) =>
      api<{ message: string; revoked: number }>(
        `/admins/${adminId}/sessions`,
        { method: "DELETE" },
        token,
      ),
    onSuccess: () => invalidateSessions(queryClient),
  });
}

export function useUpdateAdminUsername() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, username }: { id: number; username: string }) =>
      api<{ data: Admin }>(
        `/admins/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ username }),
        },
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      invalidateSessions(queryClient);
    },
  });
}

export function useUpdateAdminPassword() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      password,
      password_confirmation,
    }: {
      id: number;
      password: string;
      password_confirmation: string;
    }) =>
      api<{ message: string }>(
        `/admins/${id}/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ password, password_confirmation }),
        },
        token,
      ),
    onSuccess: () => invalidateSessions(queryClient),
  });
}
