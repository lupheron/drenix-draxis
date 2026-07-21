"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EyeLogo from "@/components/Icons/EyeLogo";
import ProfileMenu from "@/components/Portal/ProfileMenu";
import { COMPANIES } from "@/constants/companies";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/utils/cn";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = authStorage.isAdmin();
  const canAccessAnalytics = authStorage.canAccessAnalytics();
  const [hrOpen, setHrOpen] = useState(
    pathname.startsWith("/human-resources"),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-6 py-6">
          <Link href={isAdmin ? "/command-center" : "/command-center"} className="group flex items-center gap-3">
            <EyeLogo className="h-8 w-8 text-foreground/70 transition-colors group-hover:text-foreground" />
            <div>
              <p className="text-sm font-medium tracking-[0.35em] text-foreground">
                DRAXIS
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                Logistics
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <NavLink href="/command-center" active={pathname.startsWith("/command-center")}>
            Command Center
          </NavLink>

          {isAdmin ? (
            <>
              <NavLink href="/company-control" active={pathname.startsWith("/company-control")}>
                Company Control
              </NavLink>
              <div>
                <button
                  type="button"
                  onClick={() => setHrOpen((open) => !open)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm border px-3 py-2.5 text-sm transition-colors",
                    pathname.startsWith("/human-resources")
                      ? "border-border-strong bg-accent-dim text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/50 hover:text-foreground",
                  )}
                >
                  <span>Human Resources</span>
                  <span className="text-xs">{hrOpen ? "▾" : "▸"}</span>
                </button>
                {hrOpen ? (
                  <ul className="mt-1 space-y-1 pl-3">
                    {COMPANIES.map((company) => (
                      <li key={company.code}>
                        <NavLink
                          href={`/human-resources/${company.code.toLowerCase()}`}
                          active={pathname === `/human-resources/${company.code.toLowerCase()}`}
                          nested
                        >
                          {company.code}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          ) : null}

          {canAccessAnalytics ? (
            <NavLink href="/analytics" active={pathname.startsWith("/analytics")}>
              Analytics
            </NavLink>
          ) : null}
        </nav>

        <div className="relative z-20 overflow-visible border-t border-border px-4 py-4">
          <ProfileMenu />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  active,
  nested,
  children,
}: {
  href: string;
  active: boolean;
  nested?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-sm border px-3 py-2.5 text-sm transition-colors",
        nested && "py-2 text-xs",
        active
          ? "border-border-strong bg-accent-dim text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/50 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
