import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Employee, EmployeePayload } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useCreateUser() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EmployeePayload) =>
      api<{ data: Employee }>(
        "/users",
        { method: "POST", body: JSON.stringify(body) },
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
