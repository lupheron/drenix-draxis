"use client";

import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import type { Employee } from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";

type DeleteEmployeeModalDefaultProps = {
  employee: Employee | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (employeeId: string) => Promise<void>;
};

export default function DeleteEmployeeModalDefault({
  employee,
  open,
  loading = false,
  onClose,
  onConfirm,
}: DeleteEmployeeModalDefaultProps) {
  if (!employee) return null;

  async function handleConfirm() {
    if (!employee) return;
    await onConfirm(employee.id);
    onClose();
  }

  return (
    <ModalDefault
      open={open}
      title="Delete Employee"
      description={`Remove ${getEmployeeFullName(employee)} from the system. This action cannot be undone.`}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="flex justify-end gap-3">
        <ButtonDefault type="button" variant="ghost" onClick={onClose}>
          Cancel
        </ButtonDefault>
        <ButtonDefault
          type="button"
          onClick={() => void handleConfirm()}
          disabled={loading}
          className="bg-danger text-white hover:bg-danger/90"
        >
          {loading ? "Deleting..." : "Delete"}
        </ButtonDefault>
      </div>
    </ModalDefault>
  );
}
