"use client";

import { usePathname } from "next/navigation";
import AppShellDefault from "@/components/Layout/AppShell/AppShellDefault";
import RequireAuth from "@/components/Portal/RequireAuth";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandaloneAnalytics = pathname.startsWith("/analytics/standalone");
  const isAnalytics = pathname.startsWith("/analytics");

  if (isStandaloneAnalytics) {
    return (
      <RequireAuth guestAllowed guestRole="ceo">
        {children}
      </RequireAuth>
    );
  }

  return (
    <RequireAuth guestAllowed guestRole={isAnalytics ? "ceo" : undefined}>
      <AppShellDefault>{children}</AppShellDefault>
    </RequireAuth>
  );
}
