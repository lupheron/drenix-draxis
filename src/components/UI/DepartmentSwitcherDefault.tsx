"use client";

import type { Department } from "@/types/staff";
import { cn } from "@/utils/cn";

type DepartmentSwitcherDefaultProps = {
  departments: Department[];
  activeId: string;
  onChange: (departmentId: string) => void;
  className?: string;
};

export default function DepartmentSwitcherDefault({
  departments,
  activeId,
  onChange,
  className,
}: DepartmentSwitcherDefaultProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-b border-border pb-4",
        className,
      )}
    >
      {departments.map((department) => {
        const isActive = department.id === activeId;

        return (
          <button
            key={department.id}
            type="button"
            onClick={() => onChange(department.id)}
            className={cn(
              "border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors",
              isActive
                ? "border-border-strong bg-accent-dim text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-accent-dim/50 hover:text-foreground",
            )}
          >
            {department.label}
          </button>
        );
      })}
    </div>
  );
}
