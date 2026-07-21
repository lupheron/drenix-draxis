"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/utils/cn";

export default function ProfileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  const isAdmin = authStorage.isAdmin();
  const isSuperAdmin = authStorage.isSuperAdmin();
  const admin = authStorage.getAdmin();
  const guestProfile = authStorage.getAccessProfile();
  const { data: pending } = usePendingRequests();
  const pendingCount = pending?.data.length ?? 0;

  const displayName = isAdmin
    ? (admin?.username ?? "Admin")
    : (guestProfile?.label ?? "Guest");

  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  return (
    <div ref={menuRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-sm border border-border px-3 py-2 transition-colors hover:border-border-strong hover:bg-accent-dim/50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-dim text-xs font-medium text-foreground">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm text-foreground">{displayName}</span>
          <span className="block text-[10px] uppercase tracking-[0.15em] text-muted">
            {isAdmin
              ? authStorage.getRole()?.replace("_", " ")
              : guestProfile?.company}
          </span>
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          role="menu"
          className="absolute bottom-full left-0 right-0 z-50 mb-2 w-56 border border-border bg-surface py-1 shadow-2xl"
        >
          {isAdmin ? (
            <>
              <MenuLink href="/profile/notifications" badge={pendingCount}>
                Notifications
              </MenuLink>
              <MenuLink href="/profile/accepted">Accepted users</MenuLink>
              {isSuperAdmin ? (
                <MenuLink href="/profile/admins">Manage admins</MenuLink>
              ) : null}
              <div className="my-1 h-px bg-border" />
            </>
          ) : null}

          <button
            type="button"
            role="menuitem"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            className="block w-full px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent-dim/50 hover:text-foreground"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        "flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-accent-dim text-foreground"
          : "text-muted-foreground hover:bg-accent-dim/50 hover:text-foreground",
      )}
    >
      <span>{children}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-medium text-background">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
