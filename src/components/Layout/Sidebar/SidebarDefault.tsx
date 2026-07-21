"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAV } from "@/constants/navigation";
import EyeLogo from "@/components/Icons/EyeLogo";
import { cn } from "@/utils/cn";

export default function SidebarDefault() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-6 py-6">
        <Link href="/" className="group flex items-center gap-3">
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

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {PLATFORM_NAV.map((section) => (
          <div key={section.id} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.3em] text-muted">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/platform" &&
                    pathname.startsWith(item.href));

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-sm border px-3 py-2.5 transition-colors",
                        isActive
                          ? "border-border-strong bg-accent-dim text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/50 hover:text-foreground",
                      )}
                    >
                      <span className="block text-sm">{item.label}</span>
                      {item.description ? (
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {item.description}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
