"use client";

import { useEffect, useState } from "react";
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
import type {
  Employee,
  EmployeeShift,
  UpdateEmployeePayload,
} from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";
import { formatApiError } from "@/utils/api-errors";
import { formatShiftLabel, formatStatusLabel } from "@/utils/formatters";

type EditEmployeeModalDefaultProps = {
  employee: Employee | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (employeeId: string, payload: UpdateEmployeePayload) => Promise<void>;
};

export default function EditEmployeeModalDefault({
  employee,
  open,
  loading = false,
  onClose,
  onSave,
}: EditEmployeeModalDefaultProps) {
  const [form, setForm] = useState<UpdateEmployeePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) {
      setForm(null);
      return;
    }

    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      birthDate: employee.birthDate,
      joinedAt: employee.joinedAt,
      shift: employee.shift,
      salary: employee.salary,
      grade: employee.grade,
      status: employee.status,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      country: employee.country,
      gender: employee.gender,
      department: employee.department,
      position: employee.position,
      company: employee.company,
    });
    setError(null);
  }, [employee]);

  if (!employee || !form) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!employee || !form) return;

    setError(null);

    try {
      await onSave(employee.id, form);
      onClose();
    } catch (submitError) {
      setError(formatApiError(submitError));
    }
  }

  return (
    <ModalDefault
      open={open}
      title="Edit Employee"
      description={`Update profile data for ${getEmployeeFullName(employee)}.`}
      onClose={onClose}
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
              onChange={(event) =>
                setForm({ ...form, firstName: event.target.value })
              }
              required
            />
            <InputDefault
              label="Last Name"
              value={form.lastName}
              onChange={(event) =>
                setForm({ ...form, lastName: event.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Department"
              value={form.department}
              onChange={(event) =>
                setForm({ ...form, department: event.target.value })
              }
              options={DEPARTMENTS.filter((d) => d.id !== "all").map((d) => ({
                value: d.id,
                label: d.label,
              }))}
            />
            <InputDefault
              label="Position"
              value={form.position}
              onChange={(event) =>
                setForm({ ...form, position: event.target.value })
              }
            />
          </div>

          <InputDefault
            label="Company"
            value={form.company}
            onChange={(event) =>
              setForm({ ...form, company: event.target.value })
            }
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
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
            />
            <InputDefault
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
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
              onChange={(event) =>
                setForm({ ...form, birthDate: event.target.value })
              }
              required
            />
            <InputDefault
              label="Joined At"
              type="date"
              value={form.joinedAt}
              onChange={(event) =>
                setForm({ ...form, joinedAt: event.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Shift"
              value={form.shift}
              onChange={(event) =>
                setForm({
                  ...form,
                  shift: event.target.value as EmployeeShift,
                })
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
              onChange={(event) =>
                setForm({ ...form, salary: Number(event.target.value) })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectDefault
              label="Grade"
              value={form.grade}
              onChange={(event) =>
                setForm({
                  ...form,
                  grade: event.target.value as UpdateEmployeePayload["grade"],
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
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as UpdateEmployeePayload["status"],
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
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="City"
              value={form.city}
              onChange={(event) =>
                setForm({ ...form, city: event.target.value })
              }
            />
            <InputDefault
              label="State"
              value={form.state}
              onChange={(event) =>
                setForm({ ...form, state: event.target.value })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputDefault
              label="Country"
              value={form.country}
              onChange={(event) =>
                setForm({ ...form, country: event.target.value })
              }
            />
            <SelectDefault
              label="Gender"
              value={form.gender}
              onChange={(event) =>
                setForm({ ...form, gender: event.target.value })
              }
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
          <ButtonDefault type="button" variant="ghost" onClick={onClose}>
            Cancel
          </ButtonDefault>
          <ButtonDefault type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </ButtonDefault>
        </div>
      </form>
    </ModalDefault>
  );
}
