"use client";

import { useState } from "react";
import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import { DEPARTMENTS } from "@/constants/departments";
import {
  EMPLOYEE_GENDERS,
  EMPLOYEE_GRADES,
  EMPLOYEE_SHIFTS,
  EMPLOYEE_STATUSES,
  SHIFT_TIMES,
} from "@/constants/staff-options";
import type { CreateEmployeePayload, EmployeeShift } from "@/types/staff";
import { formatApiError } from "@/utils/api-errors";
import { formatShiftLabel, formatStatusLabel } from "@/utils/formatters";

type CreateEmployeeModalDefaultProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateEmployeePayload) => Promise<void>;
};

const DEFAULT_FORM: CreateEmployeePayload = {
  firstName: "",
  lastName: "",
  birthDate: "",
  joinedAt: "",
  shift: "morning",
  salary: 0,
  grade: "B",
  status: "normal",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  gender: "",
  department: "hr",
  position: "",
  company: "",
};

export default function CreateEmployeeModalDefault({
  open,
  loading = false,
  onClose,
  onCreate,
}: CreateEmployeeModalDefaultProps) {
  const [form, setForm] = useState<CreateEmployeePayload>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setForm(DEFAULT_FORM);
    setError(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await onCreate(form);
      setForm(DEFAULT_FORM);
    } catch (submitError) {
      setError(formatApiError(submitError));
    }
  }

  return (
    <ModalDefault
      open={open}
      title="Add Employee"
      description="Create a new employee profile in the staff registry."
      onClose={handleClose}
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            Profile
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <InputDefault
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              options={DEPARTMENTS.filter((d) => d.id !== "all").map((d) => ({
                value: d.id,
                label: d.label,
              }))}
            />
            <InputDefault
              label="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>

          <InputDefault
            label="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </section>

        <section className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            Contact
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <InputDefault
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            Employment
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="Birth Date"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              required
            />
            <InputDefault
              label="Joined At"
              type="date"
              value={form.joinedAt}
              onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Shift"
              value={form.shift}
              onChange={(e) =>
                setForm({ ...form, shift: e.target.value as EmployeeShift })
              }
              options={EMPLOYEE_SHIFTS.map((shift) => ({
                value: shift,
                label: `${formatShiftLabel(shift)} · ${SHIFT_TIMES[shift]}`,
              }))}
            />
            <InputDefault
              label="Salary"
              type="number"
              min={0}
              step={100}
              value={form.salary}
              onChange={(e) =>
                setForm({ ...form, salary: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Grade"
              value={form.grade}
              onChange={(e) =>
                setForm({
                  ...form,
                  grade: e.target.value as CreateEmployeePayload["grade"],
                })
              }
              options={EMPLOYEE_GRADES.map((grade) => ({
                value: grade,
                label: grade,
              }))}
            />
            <SelectDefault
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as CreateEmployeePayload["status"],
                })
              }
              options={EMPLOYEE_STATUSES.map((status) => ({
                value: status,
                label: formatStatusLabel(status),
              }))}
            />
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            Address
          </p>
          <InputDefault
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <InputDefault
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
            <SelectDefault
              label="Gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={[
                { value: "", label: "Not specified" },
                ...EMPLOYEE_GENDERS.map((gender) => ({
                  value: gender,
                  label: formatStatusLabel(gender),
                })),
              ]}
            />
          </div>
        </section>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <ButtonDefault type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </ButtonDefault>
          <ButtonDefault type="submit" disabled={loading}>
            {loading ? "Creating..." : "Add Employee"}
          </ButtonDefault>
        </div>
      </form>
    </ModalDefault>
  );
}
