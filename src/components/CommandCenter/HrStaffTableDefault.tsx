import type { EmployeeWithPerformance } from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";
import AttendanceBadgeDefault from "@/components/UI/AttendanceBadgeDefault";
import GradeBadgeDefault from "@/components/UI/GradeBadgeDefault";
import StaffRowActionsDefault from "@/components/UI/StaffRowActionsDefault";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatMinutes,
  formatPercent,
} from "@/utils/formatters";
import { cn } from "@/utils/cn";

type HrStaffTableDefaultProps = {
  employees: EmployeeWithPerformance[];
  onEdit: (employee: EmployeeWithPerformance) => void;
  onWriteCharge: (employee: EmployeeWithPerformance) => void;
  onDelete: (employee: EmployeeWithPerformance) => void;
};

const HEADERS = [
  "Rank",
  "Name",
  "Shift Time",
  "Attendance",
  "First Day",
  "Calls",
  "Performance",
  "Hours Worked",
  "On Call",
  "Recordings",
  "Hires",
  "Hire Rate",
  "Leads",
  "Follow Up",
  "Reject",
  "Hired",
  "On Process",
  "Break Warnings",
  "Charges",
  "Salary",
  "Actions",
] as const;

export default function HrStaffTableDefault({
  employees,
  onEdit,
  onWriteCharge,
  onDelete,
}: HrStaffTableDefaultProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[2400px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-elevated">
            {HEADERS.map((header) => (
              <th
                key={header}
                className="px-3 py-3 text-[10px] font-normal uppercase tracking-[0.12em] text-muted whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={HEADERS.length}
                className="px-4 py-12 text-center text-sm text-muted"
              >
                No HR staff records match your filters.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr
                key={employee.id}
                className={cn(
                  "border-b border-border last:border-b-0 hover:bg-accent-dim/30",
                  employee.rank === 1 && "bg-success/5",
                  employee.performance.attendance === "absent" && "bg-danger/5",
                )}
              >
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  #{employee.rank}
                </td>
                <td className="px-3 py-3 text-foreground whitespace-nowrap">
                  {getEmployeeFullName(employee)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {employee.shiftTime}
                </td>
                <td className="px-3 py-3">
                  <AttendanceBadgeDefault
                    status={employee.performance.attendance}
                  />
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(employee.joinedAt)}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.callsMade}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <GradeBadgeDefault grade={employee.grade} />
                    <span className="font-mono text-xs text-muted">
                      {employee.performance.score}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground whitespace-nowrap">
                  {formatHours(employee.performance.hoursWorked)}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground whitespace-nowrap">
                  {formatMinutes(employee.performance.minutesSpoken)}
                </td>
                <td className="px-3 py-3">
                  <span className="block text-xs text-foreground">
                    {employee.performance.recordingsCount} rec
                  </span>
                  <span className="block text-[10px] text-muted">
                    Overview ready
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.hires}
                </td>
                <td className="px-3 py-3 font-mono text-foreground">
                  {formatPercent(employee.performance.hireRate)}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.leads}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.followUp}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.reject}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.hired}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.onProcess}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {employee.performance.breakWarnings}
                </td>
                <td className="px-3 py-3 font-mono text-foreground whitespace-nowrap">
                  {formatCurrency(employee.performance.charges)}
                </td>
                <td className="px-3 py-3 font-mono text-foreground whitespace-nowrap">
                  {formatCurrency(employee.salary)}
                </td>
                <td className="px-3 py-3">
                  <StaffRowActionsDefault
                    onEdit={() => onEdit(employee)}
                    onWriteCharge={() => onWriteCharge(employee)}
                    onDelete={() => onDelete(employee)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
