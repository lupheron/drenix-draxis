import type { HrPerformanceTier } from "@/types/performance-ranking";
import {
  HR_PERFORMANCE_TIER_LABELS,
} from "@/utils/performance-ranking";
import { cn } from "@/utils/cn";

type Props = {
  tier: HrPerformanceTier;
  confidence?: "low" | "medium" | "high";
  className?: string;
  showLabel?: boolean;
};

const tierStyles: Record<HrPerformanceTier, string> = {
  distinguished: "border-amber-300/60 text-amber-200 bg-amber-500/15",
  advanced: "border-violet-400/50 text-violet-200 bg-violet-500/15",
  proficient: "border-border-strong text-foreground bg-accent-dim",
  developing: "border-border text-muted-foreground bg-transparent",
  provisional: "border-border text-muted bg-transparent",
  at_risk: "border-danger/50 text-danger bg-danger/10",
};

export default function HrPerformanceRankBadge({
  tier,
  confidence,
  className,
  showLabel = true,
}: Props) {
  const provisional = confidence === "low" && tier !== "provisional";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        tierStyles[tier],
        className,
      )}
      title={
        provisional
          ? `${HR_PERFORMANCE_TIER_LABELS[tier]} — provisional (limited data)`
          : HR_PERFORMANCE_TIER_LABELS[tier]
      }
    >
      {showLabel ? HR_PERFORMANCE_TIER_LABELS[tier] : tier.slice(0, 3)}
      {provisional ? <span className="opacity-70">*</span> : null}
    </span>
  );
}
