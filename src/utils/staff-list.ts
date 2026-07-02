import type { Employee } from "@/types/staff";
import { getEmployeeFullName } from "@/types/staff";

export function filterEmployeesByDepartment(
  employees: Employee[],
  departmentId: string,
): Employee[] {
  if (departmentId === "all") return employees;
  return employees.filter((employee) => employee.department === departmentId);
}

export function sortEmployeesByName(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.firstName.localeCompare(b.firstName);
  });
}

export function searchEmployees<T extends Employee>(
  employees: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return employees;

  return employees.filter((employee) => {
    const fullName = getEmployeeFullName(employee).toLowerCase();
    return (
      fullName.includes(normalized) ||
      employee.email.toLowerCase().includes(normalized) ||
      employee.phone.includes(normalized)
    );
  });
}
