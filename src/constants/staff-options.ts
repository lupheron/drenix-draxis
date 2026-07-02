import type { EmployeeShift } from "@/types/staff";

export const SHIFT_TIMES: Record<EmployeeShift, string> = {
  morning: "06:00 – 14:00",
  afternoon: "14:00 – 22:00",
  night: "22:00 – 06:00",
  flexible: "09:00 – 17:00",
};

export const EMPLOYEE_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
] as const;

export const EMPLOYEE_SHIFTS = [
  "morning",
  "afternoon",
  "night",
  "flexible",
] as const;

export const EMPLOYEE_STATUSES = ["normal", "close_monitor"] as const;

export const EMPLOYEE_GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
