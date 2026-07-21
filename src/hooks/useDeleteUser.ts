import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import { queryKeys } from "@/hooks/query-keys";

export function useDeleteUser() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/users/${id}`, { method: "DELETE" }, token),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.user(id) });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
