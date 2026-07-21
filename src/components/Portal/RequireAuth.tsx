"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { authStorage } from "@/lib/auth-storage";

type RequireAuthProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  guestAllowed?: boolean;
  /** When set, guest (access) users must match this role. Admins always pass. */
  guestRole?: "ceo" | "head_hr";
};

export default function RequireAuth({
  children,
  adminOnly = false,
  superAdminOnly = false,
  guestAllowed = true,
  guestRole,
}: RequireAuthProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = authStorage.getToken();
    const userType = authStorage.getUserType();
    const role = authStorage.getRole();

    if (!token) {
      router.replace("/");
      return;
    }

    if (adminOnly && userType !== "admin") {
      router.replace(userType === "access" ? "/command-center" : "/");
      return;
    }

    if (superAdminOnly && role !== "super_admin") {
      router.replace("/employees");
      return;
    }

    if (!guestAllowed && userType === "access") {
      router.replace("/employees");
      return;
    }

    if (userType === "access" && guestRole) {
      const profile = authStorage.getAccessProfile();
      if (profile?.role_type !== guestRole) {
        router.replace("/command-center");
        return;
      }
    }

    setReady(true);
  }, [adminOnly, guestAllowed, guestRole, router, superAdminOnly]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <EyeLoadingDefault size="lg" label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
