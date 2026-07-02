import type { Employee } from "@/types/staff";
import { DEPARTMENTS } from "@/constants/departments";
import GradeBadgeDefault from "@/components/UI/GradeBadgeDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import StaffRowActionsDefault from "@/components/UI/StaffRowActionsDefault";
import {
  formatCurrency,
  formatDate,
  formatShiftLabel,
  formatStatusLabel,
} from "@/utils/formatters";
import { cn } from "@/utils/cn";

type StaffTableDefaultProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onWriteCharge: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

const HEADERS = [
  "First Name",
  "Last Name",
  "Department",
  "Position",
  "Company",
  "Phone",
  "Email",
  "Birth Date",
  "Joined At",
  "Shift",
  "Salary",
  "Grade",
  "Status",
  "Gender",
  "Address",
  "City",
  "State",
  "Country",
  "Actions",
] as const;

function getDepartmentLabel(departmentId: string): string {
  return (
    DEPARTMENTS.find((department) => department.id === departmentId)?.label ??
    departmentId
  );
}

export default function StaffTableDefault({
  employees,
  onEdit,
  onWriteCharge,
  onDelete,
}: StaffTableDefaultProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[2200px] text-left text-sm">
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
                No staff records match your filters.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr
                key={employee.id}
                className={cn(
                  "border-b border-border last:border-b-0 hover:bg-accent-dim/30",
                  employee.status === "close_monitor" && "bg-warning/5",
                )}
              >
                <td className="px-3 py-3 text-foreground whitespace-nowrap">
                  {employee.firstName}
                </td>
                <td className="px-3 py-3 text-foreground whitespace-nowrap">
                  {employee.lastName}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {getDepartmentLabel(employee.department)}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.position}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.company}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {employee.phone}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {employee.email}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(employee.birthDate)}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(employee.joinedAt)}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {formatShiftLabel(employee.shift)}
                </td>
                <td className="px-3 py-3 font-mono text-foreground whitespace-nowrap">
                  {formatCurrency(employee.salary)}
                </td>
                <td className="px-3 py-3">
                  <GradeBadgeDefault grade={employee.grade} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadgeDefault
                    status={employee.status}
                    variant={
                      employee.status === "close_monitor" ? "warning" : "muted"
                    }
                  />
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.gender ? formatStatusLabel(employee.gender) : "—"}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.address}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.city}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.state}
                </td>
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {employee.country}
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
