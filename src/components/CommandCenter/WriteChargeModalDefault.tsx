"use client";

import { useEffect, useState } from "react";
import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import type { CreateChargePayload, Employee } from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";

type WriteChargeModalDefaultProps = {
  employee: Employee | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (employeeId: string, payload: CreateChargePayload) => Promise<void>;
};

export default function WriteChargeModalDefault({
  employee,
  open,
  loading = false,
  onClose,
  onSave,
}: WriteChargeModalDefaultProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setDate(new Date().toISOString().slice(0, 10));
    setAmount("");
    setDescription("");
    setError(null);
  }, [open, employee?.id]);

  if (!employee) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!date) {
      setError("Charge date is required.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter a valid charge amount.");
      return;
    }

    if (!employee) return;

    setError(null);

    try {
      await onSave(employee.id, {
        date,
        amount: parsedAmount,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save charge.",
      );
    }
  }

  return (
    <ModalDefault
      open={open}
      title="Write Charge"
      description={`Add a charge for ${getEmployeeFullName(employee)}. It will count toward the selected performance date range.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputDefault
          label="Charge Date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          hint="This charge applies only if the date falls inside your top filter range."
          required
        />

        <InputDefault
          label="Amount"
          type="number"
          min={0}
          step={0.01}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          required
        />

        <InputDefault
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional note"
        />

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <ButtonDefault type="button" variant="ghost" onClick={onClose}>
            Cancel
          </ButtonDefault>
          <ButtonDefault type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Charge"}
          </ButtonDefault>
        </div>
      </form>
    </ModalDefault>
  );
}
