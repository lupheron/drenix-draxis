import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AccessRequest, ApproveCredentials } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useApproveRequest() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<{
        data: AccessRequest;
        credentials: ApproveCredentials;
        message: string;
      }>(`/access-requests/${id}/approve`, { method: "POST" }, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingRequests,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.acceptedRequests,
      });
    },
  });
}
