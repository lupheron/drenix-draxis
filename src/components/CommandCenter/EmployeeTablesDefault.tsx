"use client";

import type { Employee, MetricField } from "@/lib/types";
import { getDepartmentLabel } from "@/constants/departments";
import { getCompanyLabel } from "@/constants/companies";
import StaffRowActionsDefault from "@/components/UI/StaffRowActionsDefault";
import GradeBadgeDefault from "@/components/UI/GradeBadgeDefault";
import type { EmployeeGrade } from "@/types/staff";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import { authStorage } from "@/lib/auth-storage";
import { formatCurrency, formatDate, formatShiftLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { MetricsSourceFilter } from "@/components/UI/MetricsSourceSwitcherDefault";

type MetricColumn = { key: MetricField; label: string; title?: string };

const RINGCENTRAL_COLUMNS: MetricColumn[] = [
  { key: "calls_made", label: "Calls", title: "Total RingCentral calls" },
  { key: "minutes_on_call", label: "Minutes", title: "Total talk minutes" },
  { key: "outbound_calls", label: "Outbound" },
  { key: "inbound_calls", label: "Inbound" },
  { key: "missed_calls", label: "Missed" },
  { key: "voicemail_calls", label: "Voicemail" },
  { key: "other_calls", label: "Other" },
  { key: "outbound_minutes", label: "Out min" },
  { key: "inbound_minutes", label: "In min" },
];

const RINGCENTRAL_COMPACT: MetricColumn[] = [
  { key: "calls_made", label: "Calls" },
  { key: "minutes_on_call", label: "Minutes" },
];

const MONDAY_COLUMNS: MetricColumn[] = [
  {
    key: "leads",
    label: "Leads",
    title: "Monday New leads boards",
  },
  {
    key: "follow_up",
    label: "Follow-up",
    title: "Monday Follow up boards",
  },
  {
    key: "hires",
    label: "Hired",
    title: "Just hired — Monday HR Process JDM · Hired group",
  },
  {
    key: "loaded",
    label: "Loaded",
    title: "First load / real hire — Monday HR Process JDM · Loaded group",
  },
  {
    key: "rejected",
    label: "Rejected",
    title: "Rejected from Monday boards / HR Process",
  },
];

const LATES_COLUMN: MetricColumn = {
  key: "lates",
  label: "Lates",
  title: "Lates sync coming soon (Google Sheets)",
};

function metricColumnsForSource(
  mode: "hr" | "safety",
  source: MetricsSourceFilter,
): MetricColumn[] {
  if (source === "neither") return [];

  if (mode === "safety") {
    return [LATES_COLUMN];
  }

  if (source === "ringcentral") return [...RINGCENTRAL_COLUMNS];
  if (source === "monday") return [...MONDAY_COLUMNS];
  return [...RINGCENTRAL_COMPACT, LATES_COLUMN, ...MONDAY_COLUMNS];
}

export function isRingCentralMetric(metric: MetricField): boolean {
  return RINGCENTRAL_COLUMNS.some((column) => column.key === metric);
}

type RegistryTableProps = {
  employees: Employee[];
  onNameClick: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

export function RegistryTable({
  employees,
  onNameClick,
  onEdit,
  onDelete,
}: RegistryTableProps) {
  const showSalary = authStorage.canSeeSalary();
  const canManage = authStorage.canManageEmployees();

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-border bg-surface-elevated">
          {[
            "Name · click",
            "Department",
            "Company",
            "Position",
            "Location",
            "Phone",
            "Email",
            "Shift",
            ...(showSalary ? ["Salary"] : []),
            "Grade",
            "Status",
            "Joined",
            ...(canManage ? ["Actions"] : []),
          ].map((header) => (
            <Th key={header}>{header}</Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 ? (
          <EmptyRow
            colSpan={showSalary ? (canManage ? 13 : 12) : canManage ? 12 : 11}
          />
        ) : (
          employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-border last:border-b-0 hover:bg-accent-dim/20"
            >
              <Td>
                <NameButton
                  name={`${employee.first_name} ${employee.last_name}`}
                  onClick={() => onNameClick(employee)}
                />
              </Td>
              <Td>{getDepartmentLabel(employee.department)}</Td>
              <Td>{employee.company ? getCompanyLabel(employee.company) : "—"}</Td>
              <Td>{employee.position ?? "—"}</Td>
              <Td>
                {[employee.city, employee.state, employee.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </Td>
              <Td>{employee.phone ?? "—"}</Td>
              <Td>{employee.email ?? "—"}</Td>
              <Td className="capitalize">{formatShiftLabel(employee.shift)}</Td>
              {showSalary ? (
                <Td>
                  {employee.salary !== undefined
                    ? formatCurrency(Number(employee.salary))
                    : "—"}
                </Td>
              ) : null}
              <Td>
                <GradeBadgeDefault grade={employee.grade as EmployeeGrade} />
              </Td>
              <Td>
                <StatusBadgeDefault status={employee.status} />
              </Td>
              <Td>{formatDate(employee.joined_at.slice(0, 10))}</Td>
              {canManage && onEdit && onDelete ? (
                <Td>
                  <StaffRowActionsDefault
                    onEdit={() => onEdit(employee)}
                    onDelete={() => onDelete(employee)}
                  />
                </Td>
              ) : null}
            </tr>
          ))
        )}
      </tbody>
    </TableShell>
  );
}

type MetricsTableProps = {
  employees: Employee[];
  mode: "hr" | "safety";
  sourceFilter?: MetricsSourceFilter;
  onNameClick: (employee: Employee) => void;
  onMetricClick: (
    employee: Employee,
    metric: MetricField,
  ) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

export function MetricsTable({
  employees,
  mode,
  sourceFilter = "all",
  onNameClick,
  onMetricClick,
  onEdit,
  onDelete,
}: MetricsTableProps) {
  const showSalary = authStorage.canSeeSalary();
  const canManage = authStorage.canManageEmployees();

  const metricColumns = metricColumnsForSource(mode, sourceFilter);

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-border bg-surface-elevated">
          <Th title="Click a name to open employee details">Name · click</Th>
          <Th>Company</Th>
          <Th>Position</Th>
          {showSalary ? <Th>Salary</Th> : null}
          <Th>Grade</Th>
          {metricColumns.map((column) => (
            <Th key={column.key} title={column.title}>
              {column.label}
            </Th>
          ))}
          {canManage ? <Th>Actions</Th> : null}
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 ? (
          <EmptyRow colSpan={20} />
        ) : (
          employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-border last:border-b-0 hover:bg-accent-dim/20"
            >
              <Td>
                <NameButton
                  name={`${employee.first_name} ${employee.last_name}`}
                  onClick={() => onNameClick(employee)}
                />
              </Td>
              <Td>{employee.company ?? "—"}</Td>
              <Td>{employee.position ?? "—"}</Td>
              {showSalary ? (
                <Td>
                  {employee.salary !== undefined
                    ? formatCurrency(Number(employee.salary))
                    : "—"}
                </Td>
              ) : null}
              <Td>
                <GradeBadgeDefault grade={employee.grade as EmployeeGrade} />
              </Td>
              {metricColumns.map((column) => (
                <Td key={column.key}>
                  <MetricButton
                    value={employee.metrics?.[column.key] ?? 0}
                    title={
                      column.key === "lates" && (employee.metrics?.lates ?? 0) === 0
                        ? "Lates sync coming soon"
                        : undefined
                    }
                    onClick={() => onMetricClick(employee, column.key)}
                  />
                </Td>
              ))}
              {canManage && onEdit && onDelete ? (
                <Td>
                  <StaffRowActionsDefault
                    onEdit={() => onEdit(employee)}
                    onDelete={() => onDelete(employee)}
                  />
                </Td>
              ) : null}
            </tr>
          ))
        )}
      </tbody>
    </TableShell>
  );
}

function NameButton({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to open employee details"
      className="group inline-flex items-center gap-1.5 text-left text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
    >
      <span>{name}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-muted opacity-70 group-hover:opacity-100">
        details
      </span>
    </button>
  );
}

function MetricButton({
  value,
  onClick,
  title,
}: {
  value: number;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "font-mono text-sm underline-offset-2 hover:underline",
        value > 0 ? "text-foreground" : "text-muted",
      )}
    >
      {value}
    </button>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">{children}</table>
    </div>
  );
}

function Th({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <th
      title={title}
      className="px-3 py-3 text-[10px] font-normal uppercase tracking-[0.12em] text-muted whitespace-nowrap"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-3 text-muted-foreground whitespace-nowrap", className)}>
      {children}
    </td>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted">
        No staff records match your filters.
      </td>
    </tr>
  );
}
