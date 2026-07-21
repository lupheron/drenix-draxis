import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Admin } from "@/lib/types";
import { queryKeys } from "@/hooks/query-keys";

type CreateAdminInput = {
  username: string;
  password: string;
  role: "admin";
};

export function useCreateAdmin() {
  const token = authStorage.getToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminInput) =>
      api<{ data: Admin }>(
        "/admins",
        { method: "POST", body: JSON.stringify(body) },
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins });
    },
  });
}
