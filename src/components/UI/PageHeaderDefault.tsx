import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PageHeaderDefaultProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeaderDefault({
  title,
  description,
  actions,
  className,
}: PageHeaderDefaultProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border px-8 py-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted">
          Meridian Freight Group
        </p>
        <h1 className="mt-2 text-2xl font-light tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </header>
  );
}
