"use client";

import EyeLogo from "@/components/Icons/EyeLogo";
import { cn } from "@/utils/cn";

type EyeLoadingProps = {
  label?: string;
  /** Visual size of the eye */
  size?: "sm" | "md" | "lg";
  /** Fill available area / page section */
  fullPage?: boolean;
  /** Compact inline indicator (e.g. next to a heading) */
  inline?: boolean;
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-20 w-20",
} as const;

const INLINE_SIZE_CLASS = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export default function EyeLoadingDefault({
  label,
  size = "md",
  fullPage = false,
  inline = false,
  className,
}: EyeLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center text-foreground",
        inline
          ? "flex-row gap-2 py-0"
          : "flex-col gap-4",
        !inline && (fullPage ? "min-h-[40vh] w-full py-16" : "py-8"),
        className,
      )}
    >
      <div className="animate-eye-loading origin-center">
        <EyeLogo className={inline ? INLINE_SIZE_CLASS[size] : SIZE_CLASS[size]} />
      </div>
      {label ? (
        <p
          className={cn(
            "text-muted-foreground",
            inline
              ? "text-[10px] italic normal-case tracking-normal"
              : "text-xs uppercase tracking-[0.2em]",
          )}
        >
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
