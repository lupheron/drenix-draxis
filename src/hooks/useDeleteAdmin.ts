import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import { queryKeys } from "@/hooks/query-keys";

export function useDeleteAdmin() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/admins/${id}`, { method: "DELETE" }, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins });
    },
  });
}
