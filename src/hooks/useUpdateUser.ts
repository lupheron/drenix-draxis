import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Employee, EmployeePayload } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useUpdateUser() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: EmployeePayload }) =>
      api<{ data: Employee }>(
        `/users/${id}`,
        { method: "PUT", body: JSON.stringify(body) },
        token,
      ),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.user(response.data.id), {
        data: response.data,
      });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
