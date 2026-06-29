import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type InputDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export default function InputDefault({
  label,
  hint,
  error,
  wrapperClassName,
  leftSlot,
  rightSlot,
  className,
  id,
  ...props
}: InputDefaultProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftSlot ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leftSlot}
          </div>
        ) : null}

        <input
          id={inputId}
          className={cn(
            "h-10 w-full border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-border-strong focus:bg-surface-elevated",
            leftSlot ? "pl-10" : undefined,
            rightSlot ? "pr-10" : undefined,
            error ? "border-danger/50" : undefined,
            className,
          )}
          {...props}
        />

        {rightSlot ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {rightSlot}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
