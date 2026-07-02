import { DEPARTMENTS } from "@/constants/departments";
import type { Employee, EmployeeWithPerformance } from "@/types/staff";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatPercent,
  formatShiftLabel,
  formatStatusLabel,
} from "@/utils/formatters";

const GENERAL_EXPORT_COLUMNS = [
  "First Name",
  "Last Name",
  "Birth Date",
  "Joined At",
  "Shift",
  "Salary",
  "Grade",
  "Status",
  "Phone",
  "Email",
  "Address",
  "City",
  "State",
  "Country",
  "Gender",
  "Department",
  "Position",
  "Company",
] as const;

const HR_EXPORT_COLUMNS = [
  "Rank",
  "Name",
  "Shift Time",
  "Attendance",
  "First Day",
  "Calls",
  "Performance Mark",
  "Score",
  "Hours Worked",
  "Minutes On Call",
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
] as const;

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function getDepartmentLabel(departmentId: string): string {
  return (
    DEPARTMENTS.find((department) => department.id === departmentId)?.label ??
    departmentId
  );
}

export function buildStaffExportRows(
  employees: Employee[] | EmployeeWithPerformance[],
  departmentId: string,
): string[][] {
  if (departmentId === "hr") {
    return (employees as EmployeeWithPerformance[]).map((employee) => [
      String(employee.rank),
      `${employee.firstName} ${employee.lastName}`.trim(),
      employee.shiftTime,
      formatStatusLabel(employee.performance.attendance),
      formatDate(employee.joinedAt),
      String(employee.performance.callsMade),
      employee.grade,
      String(employee.performance.score),
      formatHours(employee.performance.hoursWorked),
      String(employee.performance.minutesSpoken),
      String(employee.performance.recordingsCount),
      String(employee.performance.hires),
      formatPercent(employee.performance.hireRate),
      String(employee.performance.leads),
      String(employee.performance.followUp),
      String(employee.performance.reject),
      String(employee.performance.hired),
      String(employee.performance.onProcess),
      String(employee.performance.breakWarnings),
      formatCurrency(employee.performance.charges),
      formatCurrency(employee.salary),
    ]);
  }

  return (employees as Employee[]).map((employee) => [
    employee.firstName,
    employee.lastName,
    formatDate(employee.birthDate),
    formatDate(employee.joinedAt),
    formatShiftLabel(employee.shift),
    formatCurrency(employee.salary),
    employee.grade,
    employee.status === "close_monitor" ? "Close Monitor" : "Normal",
    employee.phone,
    employee.email,
    employee.address,
    employee.city,
    employee.state,
    employee.country,
    employee.gender ? formatStatusLabel(employee.gender) : "",
    getDepartmentLabel(employee.department),
    employee.position,
    employee.company,
  ]);
}

export function exportStaffToExcel(
  employees: Employee[] | EmployeeWithPerformance[],
  from: string,
  to: string,
  departmentId: string,
): void {
  const header =
    departmentId === "hr"
      ? [...HR_EXPORT_COLUMNS]
      : [...GENERAL_EXPORT_COLUMNS];
  const rows = buildStaffExportRows(employees, departmentId);
  const csvContent = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `draxis-staff-${departmentId}-${from}-to-${to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
