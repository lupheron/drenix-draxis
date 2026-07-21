"use client";

import { useState } from "react";
import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import RingCentralModalDefault from "@/components/CommandCenter/RingCentralModalDefault";
import type { Employee } from "@/lib/types";
import { getDepartmentLabel } from "@/constants/departments";
import { getCompanyLabel } from "@/constants/companies";
import { formatDate } from "@/utils/formatters";

type EmployeeProfileModalProps = {
  open: boolean;
  employee: Employee | null;
  from?: string;
  to?: string;
  onClose: () => void;
};

export default function EmployeeProfileModalDefault({
  open,
  employee,
  from,
  to,
  onClose,
}: EmployeeProfileModalProps) {
  const [ringCentralOpen, setRingCentralOpen] = useState(false);
  const name = employee
    ? `${employee.first_name} ${employee.last_name}`
    : "";
  const hasRange = Boolean(from && to);
  const metrics = employee?.metrics;

  return (
    <>
      <ModalDefault
        open={open && Boolean(employee)}
        title={name || "Employee"}
        description={
          hasRange
            ? `Period ${formatDate(from!)} — ${formatDate(to!)}`
            : "Employee dossier"
        }
        onClose={onClose}
        className="max-w-2xl"
      >
        {employee ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Department"
                value={getDepartmentLabel(employee.department)}
              />
              <Field
                label="Company"
                value={
                  employee.company
                    ? getCompanyLabel(employee.company)
                    : "—"
                }
              />
              <Field label="Position" value={employee.position ?? "—"} />
              <Field label="Status" value={employee.status} />
            </dl>

            {metrics ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Calls" value={String(metrics.calls_made ?? 0)} />
                <Field
                  label="Minutes"
                  value={String(metrics.minutes_on_call ?? 0)}
                />
                <Field label="Leads" value={String(metrics.leads ?? 0)} />
                <Field
                  label="Follow-up"
                  value={String(metrics.follow_up ?? 0)}
                />
                <Field label="Hired" value={String(metrics.hires ?? 0)} />
                <Field label="Loaded" value={String(metrics.loaded ?? 0)} />
              </div>
            ) : null}

            {hasRange ? (
              <ButtonDefault
                type="button"
                onClick={() => setRingCentralOpen(true)}
              >
                Open RingCentral
              </ButtonDefault>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a performance period to open RingCentral details.
              </p>
            )}
          </div>
        ) : null}
      </ModalDefault>

      <RingCentralModalDefault
        open={ringCentralOpen && Boolean(employee) && hasRange}
        employeeName={name}
        userId={employee?.id ?? null}
        from={from ?? ""}
        to={to ?? ""}
        onClose={() => setRingCentralOpen(false)}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground capitalize">{value}</dd>
    </div>
  );
}
