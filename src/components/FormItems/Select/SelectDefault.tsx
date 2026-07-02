import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type SelectOption = {
  value: string;
  label: string;
};

type SelectDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectDefault({
  label,
  hint,
  error,
  options,
  wrapperClassName,
  className,
  id,
  ...props
}: SelectDefaultProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        className={cn(
          "h-10 w-full border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-border-strong focus:bg-surface-elevated",
          error && "border-danger/50",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
