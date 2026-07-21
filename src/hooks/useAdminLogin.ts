import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AdminSession } from "@/lib/types";

type AdminLoginInput = {
  username: string;
  password: string;
};

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (body: AdminLoginInput) => {
      const response = await api<{ data: AdminSession }>("/admin/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      authStorage.setAdminSession(response.data);
      return response.data;
    },
  });
}
