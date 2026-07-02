import type { EmployeeCharge } from "@/types/staff";

export function sumChargesInRange(
  charges: EmployeeCharge[],
  from: string,
  to: string,
): number {
  const total = charges
    .filter((charge) => charge.date >= from && charge.date <= to)
    .reduce((sum, charge) => sum + charge.amount, 0);

  return Math.round(total * 100) / 100;
}
