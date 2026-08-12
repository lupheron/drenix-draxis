"use client";

import { useState } from "react";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import DatePickerDefault from "@/components/FormItems/DatePicker/DatePickerDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import ClientPortalAccessSection from "@/components/Portal/ClientPortalAccessSection";
import {
  DEPARTMENT_OPTIONS,
  EMPLOYEE_SHIFTS,
  EMPLOYEE_STATUSES,
} from "@/constants/portal";
import { COMPANIES } from "@/constants/companies";
import { getDepartmentLabel } from "@/constants/departments";
import type {
  Employee,
  EmployeePayload,
  PortalCredentialsPayload,
} from "@/lib/types";
import {
  normalizeCompanyCode,
  normalizeDepartmentSlug,
  normalizeEmployeePayload,
} from "@/lib/api/employee-payload";
import { formatApiError } from "@/utils/portal-errors";

type EmployeeFormProps = {
  initial?: Employee;
  onSubmit: (
    payload: EmployeePayload,
    portal?: PortalCredentialsPayload | null,
  ) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  defaultDepartment?: "hr" | "safety";
  lockDepartment?: boolean;
  defaultCompany?: string;
  /** Edit only: reset portal password without saving the rest of the form. */
  onResetPortalCredentials?: (
    portal: PortalCredentialsPayload,
  ) => Promise<void>;
};

const EMPTY_FORM: EmployeePayload = {
  first_name: "",
  last_name: "",
  birth_date: "",
  joined_at: "",
  shift: "morning",
  salary: 0,
  grade: "",
  status: "normal",
  department: "hr",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  gender: "",
  position: "",
  company: "JM",
};

function employeeToPayload(employee: Employee): EmployeePayload {
  return normalizeEmployeePayload({
    first_name: employee.first_name,
    last_name: employee.last_name,
    birth_date: employee.birth_date.slice(0, 10),
    joined_at: employee.joined_at.slice(0, 10),
    shift: employee.shift,
    salary: Number(employee.salary ?? 0),
    grade: employee.grade,
    status: employee.status,
    department: normalizeDepartmentSlug(employee.department),
    phone: employee.phone ?? "",
    email: employee.email ?? "",
    address: employee.address ?? "",
    city: employee.city ?? "",
    state: employee.state ?? "",
    country: employee.country ?? "",
    gender: employee.gender ?? "",
    position: employee.position ?? "",
    company: normalizeCompanyCode(employee.company),
  });
}

function resolvePortalPayload(
  mode: "create" | "edit",
  enabled: boolean,
  username: string,
  password: string,
  existingUsername?: string | null,
): PortalCredentialsPayload | null {
  const user = username.trim() || existingUsername?.trim() || "";
  const pass = password.trim();

  if (mode === "create") {
    if (!enabled) return null;
    if (!user || !pass) {
      throw new Error("Portal username and password are required when issuing access.");
    }
    return { username: user, password: pass };
  }

  // Edit: only send when password is provided (reset / issue)
  if (!pass) return null;
  if (!user) {
    throw new Error("Portal username is required to set or reset the password.");
  }
  return { username: user, password: pass };
}

export default function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save employee",
  defaultDepartment = "hr",
  lockDepartment = false,
  defaultCompany = "JM",
  onResetPortalCredentials,
}: EmployeeFormProps) {
  const mode = initial ? "edit" : "create";
  const [form, setForm] = useState<EmployeePayload>(
    initial
      ? employeeToPayload(initial)
      : { ...EMPTY_FORM, department: defaultDepartment, company: defaultCompany },
  );
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [portalUsername, setPortalUsername] = useState(
    initial?.portal_username ?? "",
  );
  const [portalPassword, setPortalPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  function updateField<K extends keyof EmployeePayload>(
    key: K,
    value: EmployeePayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const portal = resolvePortalPayload(
        mode,
        portalEnabled,
        portalUsername,
        portalPassword,
        initial?.portal_username,
      );
      await onSubmit(normalizeEmployeePayload(form), portal);
      setPortalPassword("");
    } catch (submitError) {
      setError(formatApiError(submitError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetOnly() {
    if (!onResetPortalCredentials) return;
    setError(null);
    setResetLoading(true);
    try {
      const portal = resolvePortalPayload(
        "edit",
        true,
        portalUsername,
        portalPassword,
        initial?.portal_username,
      );
      if (!portal) {
        throw new Error("Enter a new portal password to reset.");
      }
      await onResetPortalCredentials(portal);
      setPortalPassword("");
    } catch (resetError) {
      setError(formatApiError(resetError));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
      {error ? (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <InputDefault
          label="First name"
          required
          value={form.first_name}
          onChange={(e) => updateField("first_name", e.target.value)}
        />
        <InputDefault
          label="Last name"
          required
          value={form.last_name}
          onChange={(e) => updateField("last_name", e.target.value)}
        />
        <DatePickerDefault
          label="Birth date"
          required
          value={form.birth_date}
          onChange={(value) => updateField("birth_date", value)}
        />
        <DatePickerDefault
          label="Joined at"
          required
          value={form.joined_at}
          onChange={(value) => updateField("joined_at", value)}
        />
        <SelectDefault
          label="Shift"
          required
          value={form.shift}
          onChange={(e) =>
            updateField("shift", e.target.value as EmployeePayload["shift"])
          }
          options={EMPLOYEE_SHIFTS.map((shift) => ({
            value: shift,
            label: shift,
          }))}
        />
        <InputDefault
          label="Salary"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.salary}
          onChange={(e) => updateField("salary", Number(e.target.value))}
        />
        <InputDefault
          label="Grade"
          required
          maxLength={3}
          value={form.grade}
          onChange={(e) => updateField("grade", e.target.value)}
        />
        <SelectDefault
          label="Status"
          required
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as EmployeePayload["status"])
          }
          options={EMPLOYEE_STATUSES.map((status) => ({
            value: status,
            label: status.replace("_", " "),
          }))}
        />
        <SelectDefault
          label="Department"
          required
          disabled={lockDepartment}
          value={form.department}
          onChange={(e) => updateField("department", e.target.value)}
          options={DEPARTMENT_OPTIONS.map((department) => ({
            value: department,
            label: getDepartmentLabel(department),
          }))}
        />
        <SelectDefault
          label="Company"
          required
          hint="Must be JM, WF, or BP for guest access scoping"
          value={form.company ?? "JM"}
          onChange={(e) => updateField("company", e.target.value)}
          options={COMPANIES.map((company) => ({
            value: company.code,
            label: `${company.code} — ${company.label}`,
          }))}
        />
        <InputDefault
          label="Position"
          value={form.position ?? ""}
          onChange={(e) => updateField("position", e.target.value)}
        />
        <InputDefault
          label="Gender"
          value={form.gender ?? ""}
          onChange={(e) => updateField("gender", e.target.value)}
        />
        <InputDefault
          label="Phone"
          value={form.phone ?? ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />
        <InputDefault
          label="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => updateField("email", e.target.value)}
        />
        <InputDefault
          label="Address"
          className="sm:col-span-2"
          value={form.address ?? ""}
          onChange={(e) => updateField("address", e.target.value)}
        />
        <InputDefault
          label="City"
          value={form.city ?? ""}
          onChange={(e) => updateField("city", e.target.value)}
        />
        <InputDefault
          label="State"
          value={form.state ?? ""}
          onChange={(e) => updateField("state", e.target.value)}
        />
        <InputDefault
          label="Country"
          value={form.country ?? ""}
          onChange={(e) => updateField("country", e.target.value)}
        />
      </section>

      <ClientPortalAccessSection
        mode={mode}
        enabled={portalEnabled}
        onEnabledChange={setPortalEnabled}
        username={portalUsername}
        onUsernameChange={setPortalUsername}
        password={portalPassword}
        onPasswordChange={setPortalPassword}
        existingUsername={initial?.portal_username}
        hasPortalAccess={initial?.has_portal_access}
        onResetOnly={
          mode === "edit" && onResetPortalCredentials
            ? () => void handleResetOnly()
            : undefined
        }
        resetLoading={resetLoading}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonDefault type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </ButtonDefault>
        <ButtonDefault type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </ButtonDefault>
      </div>
    </form>
  );
}
