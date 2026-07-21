import type { Department } from "@/types/staff";

export const DEPARTMENTS: Department[] = [
  { id: "all", label: "All Departments" },
  { id: "hr", label: "Human Resources" },
  { id: "safety", label: "Safety" },
];

export function getDepartmentLabel(slug: string): string {
  return (
    DEPARTMENTS.find((department) => department.id === slug)?.label ??
    slug
  );
}
