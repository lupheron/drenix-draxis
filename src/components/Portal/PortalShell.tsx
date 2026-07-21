"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import EyeLogo from "@/components/Icons/EyeLogo";
import ProfileMenu from "@/components/Portal/ProfileMenu";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/utils/cn";

export default function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = authStorage.canManageEmployees();

  const navItems = [
    { href: "/employees", label: "Employees" },
    ...(isAdmin ? [{ href: "/employees/new", label: "Add employee" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-6 md:gap-10">
            <Link href="/employees" className="group flex shrink-0 items-center gap-3">
              <EyeLogo className="h-7 w-7 text-foreground/70 transition-colors group-hover:text-foreground" />
              <span className="hidden text-sm font-medium tracking-[0.35em] text-foreground sm:inline">
                DRAXIS
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/employees" &&
                    pathname.startsWith("/employees/") &&
                    pathname !== "/employees/new");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-sm px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent-dim text-foreground"
                        : "text-muted-foreground hover:bg-accent-dim/50 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {isAdmin ? (
            <ProfileMenu />
          ) : (
            <GuestLogout />
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
    </div>
  );
}

function GuestLogout() {
  const profile = authStorage.getAccessProfile();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-right text-xs text-muted-foreground sm:block">
        <span className="block text-foreground">{profile?.label}</span>
        <span>{profile?.company}</span>
      </span>
      <ProfileMenu />
    </div>
  );
}
