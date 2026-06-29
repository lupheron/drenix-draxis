import type { AttendanceStatus } from "@/types/staff";
import { cn } from "@/utils/cn";
import { formatStatusLabel } from "@/utils/formatters";

type AttendanceBadgeDefaultProps = {
  status: AttendanceStatus;
  className?: string;
};

const attendanceStyles: Record<AttendanceStatus, string> = {
  on_time: "border-success/30 text-success bg-success/10",
  late: "border-warning/30 text-warning bg-warning/10",
  absent: "border-danger/30 text-danger bg-danger/10",
};

export default function AttendanceBadgeDefault({
  status,
  className,
}: AttendanceBadgeDefaultProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap",
        attendanceStyles[status],
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
