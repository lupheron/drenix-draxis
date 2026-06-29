import type { ReactNode } from "react";
import SidebarDefault from "@/components/Layout/Sidebar/SidebarDefault";

type DashboardShellDefaultProps = {
  children: ReactNode;
};

export default function DashboardShellDefault({
  children,
}: DashboardShellDefaultProps) {
  return (
    <div className="relative flex min-h-screen bg-background">
      <SidebarDefault />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
