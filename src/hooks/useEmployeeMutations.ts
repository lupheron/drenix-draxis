import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "@/lib/api/employees";
import type { EmployeePayload } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: EmployeePayload;
    }) => updateEmployee(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(queryKeys.user(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.user(id) });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
