import DashboardShellDefault from "@/components/Layout/DashboardShell/DashboardShellDefault";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShellDefault>{children}</DashboardShellDefault>;
}
