import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { AccessSession } from "@/lib/types";

type AccessLoginInput = {
  username: string;
  password: string;
};

export function useAccessLogin() {
  return useMutation({
    mutationFn: async (body: AccessLoginInput) => {
      const response = await api<{ data: AccessSession }>("/access/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      authStorage.setAccessSession(response.data);
      return response.data;
    },
  });
}
