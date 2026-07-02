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

export type EmployeeStatus = "close_monitor" | "normal";

export type EmployeeShift = "morning" | "afternoon" | "night" | "flexible";

export type AttendanceStatus = "on_time" | "late" | "absent";

export type PerformancePeriod = "day" | "week" | "month" | "year" | "custom";

export type Department = {
  id: string;
  label: string;
};

export type EmployeeCharge = {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  description?: string;
};

export type StaffDailyLog = {
  date: string;
  attendance: AttendanceStatus;
  callsMade: number;
  hoursWorked: number;
  minutesOnCall: number;
  recordingsCount: number;
  hires: number;
  leads: number;
  followUp: number;
  reject: number;
  hired: number;
  onProcess: number;
  breakWarnings: number;
};

export type PerformanceMetrics = {
  callsMade: number;
  recordingsCount: number;
  hires: number;
  minutesSpoken: number;
  hoursWorked: number;
  leads: number;
  followUp: number;
  reject: number;
  hired: number;
  onProcess: number;
  breakWarnings: number;
  charges: number;
  hireRate: number;
  attendance: AttendanceStatus;
  score: number;
};

/** Matches Laravel `users` table profile fields */
export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  joinedAt: string;
  shift: EmployeeShift;
  shiftTime: string;
  salary: number;
  grade: EmployeeGrade;
  status: EmployeeStatus;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gender: string;
  department: string;
  position: string;
  company: string;
  dailyLogs: StaffDailyLog[];
  chargeEntries: EmployeeCharge[];
};

export type EmployeeWithPerformance = Employee & {
  performance: PerformanceMetrics;
  rank: number;
};

/** Payload sent to Laravel UsersController — no score/charges here */
export type UserPayload = {
  firstName: string;
  lastName: string;
  birthDate: string;
  joinedAt: string;
  shift: EmployeeShift;
  salary: number;
  grade: EmployeeGrade;
  status: EmployeeStatus;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gender: string;
  department: string;
  position: string;
  company: string;
};

export type UpdateEmployeePayload = UserPayload;

export type CreateEmployeePayload = UserPayload;

export type CreateChargePayload = {
  date: string;
  amount: number;
  description?: string;
};

export function getEmployeeFullName(employee: Pick<Employee, "firstName" | "lastName">): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}
