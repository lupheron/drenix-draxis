import type { EmployeeGrade } from "@/types/staff";
import { cn } from "@/utils/cn";

type GradeBadgeDefaultProps = {
  grade: EmployeeGrade;
  className?: string;
};

const gradeStyles: Record<EmployeeGrade, string> = {
  "A+": "border-success/40 text-success bg-success/10",
  A: "border-success/30 text-success bg-success/10",
  "A-": "border-success/20 text-success/90 bg-success/5",
  "B+": "border-border-strong text-foreground bg-accent-dim",
  B: "border-border-strong text-foreground bg-accent-dim",
  "B-": "border-border text-muted-foreground bg-transparent",
  "C+": "border-warning/30 text-warning bg-warning/10",
  C: "border-warning/30 text-warning bg-warning/10",
  "C-": "border-warning/20 text-warning/80 bg-warning/5",
  "D+": "border-danger/30 text-danger bg-danger/10",
  D: "border-danger/30 text-danger bg-danger/10",
  "D-": "border-danger/20 text-danger/80 bg-danger/5",
  F: "border-danger/50 text-danger bg-danger/15",
};

export default function GradeBadgeDefault({
  grade,
  className,
}: GradeBadgeDefaultProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-8 items-center justify-center border px-2 py-0.5 font-mono text-xs tracking-wide",
        gradeStyles[grade],
        className,
      )}
    >
      {grade}
    </span>
  );
}
