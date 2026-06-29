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
  charges: number;
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

export type Employee = {
  id: string;
  name: string;
  departmentId: string;
  birthday: string;
  joinedDate: string;
  shift: EmployeeShift;
  shiftTime: string;
  salary: number;
  grade: EmployeeGrade;
  status: EmployeeStatus;
  dailyLogs: StaffDailyLog[];
};

export type EmployeeWithPerformance = Employee & {
  performance: PerformanceMetrics;
  rank: number;
};
