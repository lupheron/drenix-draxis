export type EmployeeGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "F";

export type PerformancePeriod = "day" | "week" | "month" | "year" | "custom";

export type Department = {
  id: string;
  label: string;
};
