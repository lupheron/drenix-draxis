import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AccessRequest } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useRevokeAccess() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<{ data: AccessRequest; message: string }>(
        `/access-requests/${id}/revoke`,
        { method: "POST" },
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.acceptedRequests,
      });
    },
  });
}
