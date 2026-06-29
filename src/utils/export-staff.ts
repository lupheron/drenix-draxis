import { DEPARTMENTS } from "@/constants/departments";
import type { EmployeeWithPerformance } from "@/types/staff";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatPercent,
  formatShiftLabel,
  formatStatusLabel,
} from "@/utils/formatters";

const GENERAL_EXPORT_COLUMNS = [
  "Rank",
  "Name",
  "Department",
  "Birthday",
  "Joined",
  "Shift",
  "Salary",
  "Grade",
  "Status",
  "Score",
  "Calls",
  "Recordings",
  "Hires",
  "Minutes Spoken",
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
  employees: EmployeeWithPerformance[],
  departmentId: string,
): string[][] {
  if (departmentId === "hr") {
    return employees.map((employee) => [
      String(employee.rank),
      employee.name,
      employee.shiftTime,
      formatStatusLabel(employee.performance.attendance),
      formatDate(employee.joinedDate),
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

  return employees.map((employee) => [
    String(employee.rank),
    employee.name,
    getDepartmentLabel(employee.departmentId),
    formatDate(employee.birthday),
    formatDate(employee.joinedDate),
    formatShiftLabel(employee.shift),
    formatCurrency(employee.salary),
    employee.grade,
    employee.status === "close_monitor" ? "Close Monitor" : "Normal",
    String(employee.performance.score),
    String(employee.performance.callsMade),
    String(employee.performance.recordingsCount),
    String(employee.performance.hires),
    String(employee.performance.minutesSpoken),
  ]);
}

export function exportStaffToExcel(
  employees: EmployeeWithPerformance[],
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
