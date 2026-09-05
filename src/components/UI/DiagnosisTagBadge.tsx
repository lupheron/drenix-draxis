import type { DiagnosisTag } from "@/types/performance-ranking";
import { DIAGNOSIS_HINTS, DIAGNOSIS_LABELS } from "@/utils/performance-ranking";
import { cn } from "@/utils/cn";

type Props = {
  tag: DiagnosisTag;
  className?: string;
};

const tagStyles: Record<DiagnosisTag, string> = {
  lazy: "border-danger/40 text-danger bg-danger/10",
  lead_quality: "border-warning/40 text-warning bg-warning/10",
  knowledge: "border-sky-400/40 text-sky-300 bg-sky-500/10",
};

export default function DiagnosisTagBadge({ tag, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        tagStyles[tag],
        className,
      )}
      title={DIAGNOSIS_HINTS[tag]}
    >
      {DIAGNOSIS_LABELS[tag]}
    </span>
  );
}
