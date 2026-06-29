import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionPanelDefaultProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export default function SectionPanelDefault({
  title,
  description,
  children,
  className,
}: SectionPanelDefaultProps) {
  return (
    <section
      className={cn(
        "border border-border bg-surface p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-sm font-medium tracking-wide text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ?? (
        <div className="flex min-h-32 items-center justify-center border border-dashed border-border bg-background/40">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Module placeholder
          </p>
        </div>
      )}
    </section>
  );
}
