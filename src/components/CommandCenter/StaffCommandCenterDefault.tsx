"use client";

import { useMemo, useState } from "react";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import DepartmentSwitcherDefault from "@/components/UI/DepartmentSwitcherDefault";
import PeriodSwitcherDefault from "@/components/UI/PeriodSwitcherDefault";
import HrStaffTableDefault from "@/components/CommandCenter/HrStaffTableDefault";
import StaffTableDefault from "@/components/CommandCenter/StaffTableDefault";
import CreateEmployeeModalDefault from "@/components/CommandCenter/CreateEmployeeModalDefault";
import EditEmployeeModalDefault from "@/components/CommandCenter/EditEmployeeModalDefault";
import DeleteEmployeeModalDefault from "@/components/CommandCenter/DeleteEmployeeModalDefault";
import WriteChargeModalDefault from "@/components/CommandCenter/WriteChargeModalDefault";
import GradeBadgeDefault from "@/components/UI/GradeBadgeDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import { DEPARTMENTS } from "@/constants/departments";
import {
  useCreateUser,
  useCreateUserCharge,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/users/useUser";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import type {
  CreateChargePayload,
  CreateEmployeePayload,
  Employee,
  PerformancePeriod,
  UpdateEmployeePayload,
} from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";
import { exportStaffToExcel } from "@/utils/export-staff";
import { formatDate, formatMinutes } from "@/utils/formatters";
import {
  filterEmployeesByDepartment,
  searchEmployees,
  sortEmployeesByName,
} from "@/utils/staff-list";
import {
  getPeriodDateRange,
  rankEmployees,
} from "@/utils/staff-performance";

type ActiveModal = "create" | "edit" | "delete" | "charge" | null;

export default function StaffCommandCenterDefault() {
  const [departmentId, setDepartmentId] = useState("all");
  const [period, setPeriod] = useState<PerformancePeriod>("week");
  const [customFrom, setCustomFrom] = useState(() => {
    const range = getPeriodDateRange("month");
    return range.from;
  });
  const [customTo, setCustomTo] = useState(() => {
    const range = getPeriodDateRange("month");
    return range.to;
  });
  const [exportFrom, setExportFrom] = useState(() => {
    const range = getPeriodDateRange("month");
    return range.from;
  });
  const [exportTo, setExportTo] = useState(() => {
    const range = getPeriodDateRange("month");
    return range.to;
  });
  const [search, setSearch] = useState("");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const customRange =
    period === "custom" ? { from: customFrom, to: customTo } : undefined;

  const periodRange =
    period === "custom"
      ? { from: customFrom, to: customTo }
      : getPeriodDateRange(period);

  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useUsers({
    departmentId,
    from: periodRange.from,
    to: periodRange.to,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const createChargeMutation = useCreateUserCharge();

  const actionLoading =
    createUserMutation.isPending ||
    updateUserMutation.isPending ||
    deleteUserMutation.isPending ||
    createChargeMutation.isPending;

  const loadError = !isApiConfigured()
    ? "Set NEXT_PUBLIC_API_URL in .env.local to load staff from your Laravel API."
    : isError
      ? error instanceof Error
        ? error.message
        : "Could not reach Laravel API. Check your server and CORS settings."
      : null;

  const isHrView = departmentId === "hr";

  const rankedEmployees = useMemo(
    () => rankEmployees(employees, period, departmentId, customRange),
    [employees, period, departmentId, customFrom, customTo],
  );

  const staffList = useMemo(() => {
    const filtered = filterEmployeesByDepartment(employees, departmentId);
    return sortEmployeesByName(searchEmployees(filtered, search));
  }, [employees, departmentId, search]);

  const hrStaffList = useMemo(
    () => searchEmployees(rankedEmployees, search),
    [rankedEmployees, search],
  );

  const topPerformer = isHrView ? rankedEmployees[0] : undefined;

  const summaryStats = useMemo(() => {
    if (!isHrView) {
      const monitored = staffList.filter(
        (employee) => employee.status === "close_monitor",
      ).length;

      return {
        totalStaff: staffList.length,
        monitored,
      };
    }

    const totalCalls = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.callsMade,
      0,
    );
    const totalHires = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.hires,
      0,
    );
    const totalMinutes = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.minutesSpoken,
      0,
    );
    const totalCharges = rankedEmployees.reduce(
      (sum, employee) => sum + employee.performance.charges,
      0,
    );
    const monitored = rankedEmployees.filter(
      (employee) => employee.status === "close_monitor",
    ).length;

    return { totalCalls, totalHires, totalMinutes, totalCharges, monitored };
  }, [isHrView, rankedEmployees, staffList]);

  function openModal(modal: ActiveModal, employee: Employee) {
    setActiveEmployee(employee);
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(null);
    setActiveEmployee(null);
  }

  async function handleCreateEmployee(payload: CreateEmployeePayload) {
    if (!isApiConfigured()) {
      throw new ApiError(0, "API is not configured.");
    }

    await createUserMutation.mutateAsync(payload);
    closeModal();
  }

  async function handleUpdateEmployee(
    employeeId: string,
    payload: UpdateEmployeePayload,
  ) {
    if (!isApiConfigured()) {
      throw new ApiError(0, "API is not configured.");
    }

    await updateUserMutation.mutateAsync({ userId: employeeId, payload });
  }

  async function handleDeleteEmployee(employeeId: string) {
    if (!isApiConfigured()) {
      throw new ApiError(0, "API is not configured.");
    }

    await deleteUserMutation.mutateAsync(employeeId);
  }

  async function handleWriteCharge(
    employeeId: string,
    payload: CreateChargePayload,
  ) {
    if (!isApiConfigured()) {
      throw new ApiError(0, "API is not configured.");
    }

    await createChargeMutation.mutateAsync({ userId: employeeId, payload });
  }

  function handleExport() {
    const exportData = isHrView
      ? rankEmployees(employees, "custom", departmentId, {
          from: exportFrom,
          to: exportTo,
        })
      : filterEmployeesByDepartment(employees, departmentId);

    exportStaffToExcel(exportData, exportFrom, exportTo, departmentId);
  }

  return (
    <>
      <PageHeaderDefault
        title="Command Center"
        description={
          isHrView
            ? "Staff performance intelligence — call activity, hiring output, charges, and ranked operational scores."
            : "Staff registry — employee profiles synced with your Laravel users table."
        }
        actions={
          <div className="flex items-center gap-3">
            <InputDefault
              placeholder="Search staff..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56"
              aria-label="Search staff"
            />
            <ButtonDefault
              size="sm"
              onClick={() => setActiveModal("create")}
            >
              Add Employee
            </ButtonDefault>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-8">
        {isLoading ? (
          <p className="border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
            Loading staff from API...
          </p>
        ) : null}

        {loadError ? (
          <p className="border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {loadError}
          </p>
        ) : null}

        <DepartmentSwitcherDefault
          departments={DEPARTMENTS}
          activeId={departmentId}
          onChange={setDepartmentId}
        />

        {isHrView ? (
          <div className="flex flex-col gap-4 border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                Performance Window
              </p>
              <PeriodSwitcherDefault
                activePeriod={period}
                onChange={setPeriod}
                className="mt-3"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Charges and metrics calculate for{" "}
              <span className="text-foreground">
                {formatDate(periodRange.from)} — {formatDate(periodRange.to)}
              </span>
            </p>
          </div>
        ) : null}

        {isHrView && period === "custom" ? (
          <div className="grid gap-4 border border-border bg-surface p-5 sm:grid-cols-2">
            <InputDefault
              label="From"
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
            <InputDefault
              label="To"
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isHrView ? (
            <>
              <StatCardDefault
                id="top-performer"
                label="Top Performer"
                value={topPerformer ? getEmployeeFullName(topPerformer) : "—"}
                change={
                  topPerformer
                    ? `Score ${topPerformer.performance.score} · ${topPerformer.grade}`
                    : undefined
                }
                trend="up"
              />
              <StatCardDefault
                id="total-calls"
                label="Total Calls"
                value={summaryStats.totalCalls?.toLocaleString() ?? "0"}
                change="RingCentral feed"
                trend="neutral"
              />
              <StatCardDefault
                id="total-charges"
                label="Period Charges"
                value={`$${(summaryStats.totalCharges ?? 0).toLocaleString()}`}
                change="Filtered by date range"
                trend="neutral"
              />
              <StatCardDefault
                id="close-monitor"
                label="Close Monitor"
                value={String(summaryStats.monitored ?? 0)}
                change={`${formatMinutes(summaryStats.totalMinutes ?? 0)} spoken`}
                trend="down"
              />
            </>
          ) : (
            <>
              <StatCardDefault
                id="total-staff"
                label="Total Staff"
                value={String(summaryStats.totalStaff ?? 0)}
                change="Active profiles"
                trend="neutral"
              />
              <StatCardDefault
                id="close-monitor"
                label="Close Monitor"
                value={String(summaryStats.monitored ?? 0)}
                change="Requires attention"
                trend="down"
              />
            </>
          )}
        </div>

        <div className="border border-border bg-surface">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-medium tracking-wide text-foreground">
                {isHrView ? "HR Staff Ledger" : "Staff Registry"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {isHrView
                  ? "Attendance, call activity, lead pipeline, charges, and compensation — sorted by performance score."
                  : "Employee profile data from your users table — sorted by name."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <InputDefault
                label="Export from"
                type="date"
                value={exportFrom}
                onChange={(event) => setExportFrom(event.target.value)}
                wrapperClassName="min-w-36"
              />
              <InputDefault
                label="Export to"
                type="date"
                value={exportTo}
                onChange={(event) => setExportTo(event.target.value)}
                wrapperClassName="min-w-36"
              />
              <ButtonDefault
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="mb-0.5 shrink-0"
              >
                Export to Excel
              </ButtonDefault>
            </div>
          </div>

          {isHrView ? (
            <HrStaffTableDefault
              employees={hrStaffList}
              onEdit={(employee) => openModal("edit", employee)}
              onWriteCharge={(employee) => openModal("charge", employee)}
              onDelete={(employee) => openModal("delete", employee)}
            />
          ) : (
            <StaffTableDefault
              employees={staffList}
              onEdit={(employee) => openModal("edit", employee)}
              onWriteCharge={(employee) => openModal("charge", employee)}
              onDelete={(employee) => openModal("delete", employee)}
            />
          )}
        </div>

        {isHrView && topPerformer ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {rankedEmployees.slice(0, 3).map((employee, index) => (
              <article
                key={employee.id}
                className="border border-border bg-surface p-5"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  {index === 0
                    ? "Best of period"
                    : index === 1
                      ? "Second"
                      : "Third"}{" "}
                  ·{" "}
                  {period === "custom"
                    ? "Custom range"
                    : period.charAt(0).toUpperCase() + period.slice(1)}
                </p>
                <p className="mt-3 text-lg text-foreground">
                  {getEmployeeFullName(employee)}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <GradeBadgeDefault grade={employee.grade} />
                  <span className="font-mono text-sm text-muted-foreground">
                    Score {employee.performance.score}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <dt>Calls</dt>
                    <dd className="font-mono text-foreground">
                      {employee.performance.callsMade}
                    </dd>
                  </div>
                  <div>
                    <dt>Charges</dt>
                    <dd className="font-mono text-foreground">
                      ${employee.performance.charges.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt>Recordings</dt>
                    <dd className="font-mono text-foreground">
                      {employee.performance.recordingsCount}
                    </dd>
                  </div>
                  <div>
                    <dt>Minutes</dt>
                    <dd className="font-mono text-foreground">
                      {formatMinutes(employee.performance.minutesSpoken)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <CreateEmployeeModalDefault
        open={activeModal === "create"}
        loading={actionLoading}
        onClose={closeModal}
        onCreate={handleCreateEmployee}
      />

      <EditEmployeeModalDefault
        employee={activeEmployee}
        open={activeModal === "edit"}
        loading={actionLoading}
        onClose={closeModal}
        onSave={handleUpdateEmployee}
      />

      <WriteChargeModalDefault
        employee={activeEmployee}
        open={activeModal === "charge"}
        loading={actionLoading}
        onClose={closeModal}
        onSave={handleWriteCharge}
      />

      <DeleteEmployeeModalDefault
        employee={activeEmployee}
        open={activeModal === "delete"}
        loading={actionLoading}
        onClose={closeModal}
        onConfirm={handleDeleteEmployee}
      />
    </>
  );
}
