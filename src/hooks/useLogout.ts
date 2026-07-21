import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";

export function useAdminLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const token = authStorage.getToken();
      if (token && authStorage.isAdmin()) {
        await api<void>("/admin/logout", { method: "POST" }, token);
      }
      authStorage.clear();
    },
    onSuccess: () => {
      router.replace("/");
    },
  });
}

export function useAccessLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const token = authStorage.getToken();
      if (token && authStorage.isGuest()) {
        await api<void>("/access/logout", { method: "POST" }, token);
      }
      authStorage.clear();
    },
    onSuccess: () => {
      router.replace("/");
    },
  });
}

export function useLogout() {
  const adminLogout = useAdminLogout();
  const accessLogout = useAccessLogout();

  return authStorage.isAdmin() ? adminLogout : accessLogout;
}
