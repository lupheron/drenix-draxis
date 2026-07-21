import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type TextareaDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextareaDefault({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: TextareaDefaultProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={textareaId}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        className={cn(
          "min-h-28 w-full resize-y border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-border-strong focus:bg-surface-elevated",
          error && "border-danger/50",
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
