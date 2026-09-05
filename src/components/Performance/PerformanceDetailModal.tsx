"use client";

import EmployeePerformancePanel from "@/components/Performance/EmployeePerformancePanel";
import ModalDefault from "@/components/UI/ModalDefault";
import type { Employee } from "@/lib/types";
import type { EmployeePerformanceProfile } from "@/types/performance-ranking";

type Props = {
  open: boolean;
  employee: Employee | null;
  profile: EmployeePerformanceProfile | null;
  from?: string;
  to?: string;
  onClose: () => void;
};

export default function PerformanceDetailModal({
  open,
  employee,
  profile,
  from,
  to,
  onClose,
}: Props) {
  const name = employee
    ? `${employee.first_name} ${employee.last_name}`
    : "";

  return (
    <ModalDefault
      open={open && Boolean(employee && profile)}
      title={name ? `${name} · Performance` : "Performance"}
      description={
        from && to ? `Period ${from} → ${to}` : "HR performance & development plan"
      }
      onClose={onClose}
      className="max-w-2xl"
    >
      {employee && profile ? (
        <EmployeePerformancePanel employee={employee} profile={profile} />
      ) : null}
    </ModalDefault>
  );
}
