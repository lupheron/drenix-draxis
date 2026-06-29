import { cn } from "@/utils/cn";
import { formatStatusLabel } from "@/utils/formatters";

type StatusBadgeDefaultProps = {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
};

const variantStyles = {
  default: "border-border-strong text-foreground bg-accent-dim",
  success: "border-success/30 text-success bg-success/10",
  warning: "border-warning/30 text-warning bg-warning/10",
  danger: "border-danger/30 text-danger bg-danger/10",
  muted: "border-border text-muted-foreground bg-transparent",
};

export default function StatusBadgeDefault({
  status,
  variant = "default",
  className,
}: StatusBadgeDefaultProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]",
        variantStyles[variant],
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
