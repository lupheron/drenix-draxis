"use client";

import { useMemo, useState } from "react";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import DepartmentSwitcherDefault from "@/components/UI/DepartmentSwitcherDefault";
import PeriodSwitcherDefault from "@/components/UI/PeriodSwitcherDefault";
import MetricsSourceSwitcherDefault, {
  type MetricsSourceFilter,
} from "@/components/UI/MetricsSourceSwitcherDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import ModalDefault from "@/components/UI/ModalDefault";
import EmployeeForm from "@/components/Portal/EmployeeForm";
import MetricsDetailModalDefault from "@/components/CommandCenter/MetricsDetailModalDefault";
import EmployeeProfileModalDefault from "@/components/CommandCenter/EmployeeProfileModalDefault";
import {
  MetricsTable,
  RegistryTable,
  isRingCentralMetric,
} from "@/components/CommandCenter/EmployeeTablesDefault";
import RingCentralModalDefault from "@/components/CommandCenter/RingCentralModalDefault";
import { DEPARTMENTS } from "@/constants/departments";
import { COMPANY_CODES, getCompanyLabel } from "@/constants/companies";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "@/hooks/useEmployeeMutations";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { authStorage } from "@/lib/auth-storage";
import type {
  CompanyCode,
  Employee,
  EmployeePayload,
  MetricField,
} from "@/lib/types";
import type { PerformancePeriod } from "@/types/staff";
import {
  formatDateInput,
  getDateRangeForPreset,
} from "@/utils/date-ranges";
import { formatApiError } from "@/utils/portal-errors";

type ActiveModal = "create" | "edit" | "delete" | null;

export default function CommandCenterView() {
  const canManage = authStorage.canManageEmployees();
  const isAdmin = authStorage.isAdmin();

  const [departmentId, setDepartmentId] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [period, setPeriod] = useState<PerformancePeriod>("month");
  const [sourceFilter, setSourceFilter] =
    useState<MetricsSourceFilter>("all");
  const [customFrom, setCustomFrom] = useState(() =>
    getDateRangeForPreset("month").from,
  );
  const [customTo, setCustomTo] = useState(() =>
    getDateRangeForPreset("month").to,
  );
  const [search, setSearch] = useState("");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [metricModal, setMetricModal] = useState<{
    employee: Employee;
    metric: MetricField;
  } | null>(null);
  const [ringCentralEmployee, setRingCentralEmployee] =
    useState<Employee | null>(null);
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isRegistry = departmentId === "all";
  const isHr = departmentId === "hr";
  const isSafety = departmentId === "safety";

  const periodRange =
    period === "custom"
      ? { from: customFrom, to: customTo }
      : getDateRangeForPreset(period);

  const listParams = useMemo(() => {
    if (isRegistry) {
      return companyFilter ? { company: companyFilter as CompanyCode } : undefined;
    }

    return {
      department: departmentId,
      from: periodRange.from,
      to: periodRange.to,
      ...(companyFilter ? { company: companyFilter as CompanyCode } : {}),
    };
  }, [companyFilter, departmentId, isRegistry, periodRange.from, periodRange.to]);

  const { data: employees = [], isLoading, isError, error } =
    useEmployees(listParams);
  const { data: pending } = usePendingRequests();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const haystack = [
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.department,
        employee.company,
        employee.position,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [employees, search]);

  const summary = useMemo(() => {
    const total = filteredEmployees.length;
    const monitored = filteredEmployees.filter(
      (employee) => employee.status === "close_monitor",
    ).length;

    if (isRegistry) {
      const byCompany = COMPANY_CODES.reduce(
        (acc, code) => {
          acc[code] = filteredEmployees.filter(
            (employee) => employee.company === code,
          ).length;
          return acc;
        },
        {} as Record<string, number>,
      );

      return { total, monitored, byCompany };
    }

    const totals = filteredEmployees.reduce(
      (acc, employee) => {
        acc.calls += employee.metrics?.calls_made ?? 0;
        acc.minutes += employee.metrics?.minutes_on_call ?? 0;
        acc.lates += employee.metrics?.lates ?? 0;
        acc.leads += employee.metrics?.leads ?? 0;
        acc.followUp += employee.metrics?.follow_up ?? 0;
        acc.hires += employee.metrics?.hires ?? 0;
        acc.loaded += employee.metrics?.loaded ?? 0;
        acc.rejected += employee.metrics?.rejected ?? 0;
        return acc;
      },
      {
        calls: 0,
        minutes: 0,
        lates: 0,
        leads: 0,
        followUp: 0,
        hires: 0,
        loaded: 0,
        rejected: 0,
      },
    );

    return { total, monitored, ...totals };
  }, [filteredEmployees, isRegistry]);

  function openCreateModal() {
    if (!canManage || isRegistry) return;
    setActiveModal("create");
  }

  function closeModal() {
    setActiveModal(null);
    setActiveEmployee(null);
    setDeleteError(null);
  }

  async function handleCreate(payload: EmployeePayload) {
    await createMutation.mutateAsync(payload);
    closeModal();
  }

  async function handleUpdate(payload: EmployeePayload) {
    if (!activeEmployee) return;
    await updateMutation.mutateAsync({ id: activeEmployee.id, payload });
    closeModal();
  }

  async function handleDelete() {
    if (!activeEmployee) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(activeEmployee.id);
      closeModal();
    } catch (deleteErr) {
      setDeleteError(formatApiError(deleteErr));
    }
  }

  const defaultDepartment = isHr ? "hr" : isSafety ? "safety" : "hr";

  return (
    <>
      <PageHeaderDefault
        title="Command Center"
        description={
          isRegistry
            ? "Staff registry across all companies and departments."
            : isHr
              ? "Human Resources performance for the selected period."
              : "Safety team overview for the selected period."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <InputDefault
              placeholder="Search staff..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56"
              aria-label="Search staff"
            />
            {canManage && !isRegistry ? (
              <ButtonDefault size="sm" onClick={openCreateModal}>
                Add employee
              </ButtonDefault>
            ) : null}
          </div>
        }
      />

      <div className="space-y-6 px-8 py-8">
        {isLoading ? (
          <EyeLoadingDefault fullPage size="lg" label="Loading staff" />
        ) : null}

        {isError ? (
          <p className="border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error instanceof Error ? error.message : "Could not load staff."}
          </p>
        ) : null}

        <DepartmentSwitcherDefault
          departments={DEPARTMENTS.filter((department) => {
            if (isAdmin) return true;
            return department.id === "all" || department.id === "hr";
          })}
          activeId={departmentId}
          onChange={setDepartmentId}
        />

        {!isRegistry ? (
          <>
            <div className="flex flex-col gap-4 border border-border bg-surface p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                    Performance window
                  </p>
                  <PeriodSwitcherDefault
                    activePeriod={period}
                    onChange={setPeriod}
                    className="mt-3"
                  />
                </div>
                {isHr ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                      Data source
                    </p>
                    <MetricsSourceSwitcherDefault
                      active={sourceFilter}
                      onChange={setSourceFilter}
                      className="mt-3"
                    />
                  </div>
                ) : null}
              </div>
              <SelectDefault
                label="Company filter"
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                wrapperClassName="min-w-48"
                options={[
                  { value: "", label: "All companies" },
                  ...COMPANY_CODES.map((code) => ({
                    value: code,
                    label: `${code} — ${getCompanyLabel(code)}`,
                  })),
                ]}
              />
            </div>

            {period === "custom" ? (
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

            <p className="text-xs text-muted-foreground">
              Live JM data: phones from RingCentral;{" "}
              <span title="Just hired">Hired</span> /{" "}
              <span title="First load / real hire">Loaded</span> from Monday HR
              Process JDM. Refreshes every 60s.{" "}
              <span title="Lates sync coming soon">Lates</span> stay 0 until
              Google Sheets is connected.
            </p>
          </>
        ) : (
          <SelectDefault
            label="Company filter"
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            wrapperClassName="max-w-xs"
            options={[
              { value: "", label: "All companies" },
              ...COMPANY_CODES.map((code) => ({
                value: code,
                label: `${code} — ${getCompanyLabel(code)}`,
              })),
            ]}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardDefault
            id="total-staff"
            label="Total staff"
            value={String(summary.total)}
            change="In current view"
          />
          <StatCardDefault
            id="close-monitor"
            label="Close monitor"
            value={String(summary.monitored)}
            change="Requires attention"
            trend="down"
          />
          {isAdmin ? (
            <StatCardDefault
              id="pending-requests"
              label="Pending requests"
              value={String(pending?.data.length ?? 0)}
              change="Access approvals"
            />
          ) : null}
          {isRegistry && "byCompany" in summary && summary.byCompany ? (
            <StatCardDefault
              id="company-mix"
              label="JM / BP / WF"
              value={`${summary.byCompany.JM}/${summary.byCompany.BP}/${summary.byCompany.WF}`}
              change="Headcount by company"
            />
          ) : !isRegistry && "calls" in summary ? (
            <>
              {sourceFilter === "all" || sourceFilter === "ringcentral" ? (
                <StatCardDefault
                  id="calls"
                  label="Total calls"
                  value={String(summary.calls)}
                  change={`${summary.minutes} minutes`}
                />
              ) : null}
              {isHr &&
              (sourceFilter === "all" || sourceFilter === "monday") ? (
                <>
                  <StatCardDefault
                    id="leads"
                    label="Leads"
                    value={String(summary.leads)}
                    change="Monday New leads"
                  />
                  <StatCardDefault
                    id="follow-up"
                    label="Follow-up"
                    value={String(summary.followUp)}
                    change="Monday Follow up"
                  />
                  <StatCardDefault
                    id="hired"
                    label="Hired"
                    value={String(summary.hires)}
                    change="Just hired"
                  />
                  <StatCardDefault
                    id="loaded"
                    label="Loaded"
                    value={String(summary.loaded)}
                    change="First load / real hire"
                  />
                  <StatCardDefault
                    id="rejected"
                    label="Rejected"
                    value={String(summary.rejected)}
                    change="Monday rejected"
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium tracking-wide text-foreground">
              {isRegistry
                ? "Staff registry"
                : isHr
                  ? "Human Resources ledger"
                  : "Safety ledger"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {isRegistry
                ? "Basic employee profile data. Click a name for details."
                : "Click a metric for daily / RingCentral breakdown."}
            </p>
            <p className="mt-3 border border-border-strong bg-accent-dim px-3 py-2 text-xs text-foreground">
              Tip: click a person&apos;s <span className="font-medium underline">name</span>{" "}
              to open their full details (profile + RingCentral).
            </p>
          </div>

          {isRegistry ? (
            <RegistryTable
              employees={filteredEmployees}
              onNameClick={setProfileEmployee}
              onEdit={
                canManage
                  ? (employee) => {
                      setActiveEmployee(employee);
                      setActiveModal("edit");
                    }
                  : undefined
              }
              onDelete={
                canManage
                  ? (employee) => {
                      setActiveEmployee(employee);
                      setActiveModal("delete");
                    }
                  : undefined
              }
            />
          ) : (
            <MetricsTable
              employees={filteredEmployees}
              mode={isHr ? "hr" : "safety"}
              sourceFilter={isHr ? sourceFilter : "all"}
              onNameClick={setProfileEmployee}
              onMetricClick={(employee, metric) => {
                if (isRingCentralMetric(metric)) {
                  setRingCentralEmployee(employee);
                  return;
                }
                setMetricModal({ employee, metric });
              }}
              onEdit={
                canManage
                  ? (employee) => {
                      setActiveEmployee(employee);
                      setActiveModal("edit");
                    }
                  : undefined
              }
              onDelete={
                canManage
                  ? (employee) => {
                      setActiveEmployee(employee);
                      setActiveModal("delete");
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>

      <ModalDefault
        open={activeModal === "create"}
        title="Add employee"
        description={`Creating for ${isHr ? "Human Resources" : "Safety"}. Choose company JM, WF, or BP.`}
        onClose={closeModal}
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <EmployeeForm
          submitLabel="Create employee"
          onCancel={closeModal}
          onSubmit={handleCreate}
          defaultDepartment={defaultDepartment}
          lockDepartment
        />
      </ModalDefault>

      <ModalDefault
        open={activeModal === "edit" && Boolean(activeEmployee)}
        title="Edit employee"
        onClose={closeModal}
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        {activeEmployee ? (
          <EmployeeForm
            key={activeEmployee.id}
            initial={activeEmployee}
            submitLabel="Save changes"
            onCancel={closeModal}
            onSubmit={handleUpdate}
          />
        ) : null}
      </ModalDefault>

      <ModalDefault
        open={activeModal === "delete" && Boolean(activeEmployee)}
        title="Delete employee"
        description={
          activeEmployee
            ? `Remove ${activeEmployee.first_name} ${activeEmployee.last_name}?`
            : undefined
        }
        onClose={closeModal}
      >
        {deleteError ? (
          <p className="mb-4 text-sm text-danger">{deleteError}</p>
        ) : null}
        <div className="flex justify-end gap-3">
          <ButtonDefault type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </ButtonDefault>
          <ButtonDefault
            type="button"
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => void handleDelete()}
          >
            Delete
          </ButtonDefault>
        </div>
      </ModalDefault>

      <MetricsDetailModalDefault
        open={Boolean(metricModal)}
        employeeName={
          metricModal
            ? `${metricModal.employee.first_name} ${metricModal.employee.last_name}`
            : ""
        }
        userId={metricModal?.employee.id ?? null}
        metric={metricModal?.metric ?? null}
        from={periodRange.from}
        to={periodRange.to}
        onClose={() => setMetricModal(null)}
      />

      <RingCentralModalDefault
        open={Boolean(ringCentralEmployee)}
        employeeName={
          ringCentralEmployee
            ? `${ringCentralEmployee.first_name} ${ringCentralEmployee.last_name}`
            : ""
        }
        userId={ringCentralEmployee?.id ?? null}
        from={periodRange.from}
        to={periodRange.to}
        onClose={() => setRingCentralEmployee(null)}
      />

      <EmployeeProfileModalDefault
        open={Boolean(profileEmployee)}
        employee={profileEmployee}
        from={isRegistry ? undefined : periodRange.from}
        to={isRegistry ? undefined : periodRange.to}
        onClose={() => setProfileEmployee(null)}
      />
    </>
  );
}
