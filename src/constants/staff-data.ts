import type { AttendanceStatus, EmployeeShift, StaffDailyLog } from "@/types/staff";

const SHIFT_TIMES: Record<EmployeeShift, string> = {
  morning: "06:00 – 14:00",
  afternoon: "14:00 – 22:00",
  night: "22:00 – 06:00",
  flexible: "09:00 – 17:00",
};

const ATTENDANCE_CYCLE: AttendanceStatus[] = ["on_time", "on_time", "late", "on_time", "absent"];

function buildDailyLogs(seed: number, days: number): StaffDailyLog[] {
  const logs: StaffDailyLog[] = [];
  const today = new Date("2026-06-19T12:00:00Z");

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);
    const factor = 0.6 + ((seed + i * 7) % 40) / 100;
    const leads = Math.round(8 + factor * 22 + (i % 4) * 2);
    const hired = Math.round(factor * 3 + (i % 3 === 0 ? 1 : 0));
    const reject = Math.round(leads * (0.15 + (seed % 10) / 100));
    const onProcess = Math.round(leads * 0.2);
    const followUp = Math.round(leads * (0.4 + factor * 0.3));

    logs.push({
      date: date.toISOString().slice(0, 10),
      attendance: ATTENDANCE_CYCLE[(seed + i) % ATTENDANCE_CYCLE.length],
      callsMade: Math.round(12 + factor * 28 + (i % 5) * 2),
      hoursWorked: Math.round((6 + factor * 3) * 10) / 10,
      minutesOnCall: Math.round(90 + factor * 180 + i * 3),
      recordingsCount: Math.round(8 + factor * 18),
      hires: hired,
      leads,
      followUp,
      reject,
      hired,
      onProcess,
      breakWarnings: (seed + i) % 7 === 0 ? Math.round(1 + factor * 2) : 0,
      charges: Math.round((factor * 120 + i * 2) * 100) / 100,
    });
  }

  return logs;
}

function employeeBase(
  seed: number,
  data: Omit<
    import("@/types/staff").Employee,
    "dailyLogs" | "shiftTime"
  > & { shift: EmployeeShift },
) {
  return {
    ...data,
    shiftTime: SHIFT_TIMES[data.shift],
    dailyLogs: buildDailyLogs(seed, 400),
  };
}

export const MOCK_EMPLOYEES = [
  employeeBase(1, {
    id: "emp-001",
    name: "Sarah Chen",
    departmentId: "hr",
    birthday: "1991-03-14",
    joinedDate: "2019-06-03",
    shift: "morning",
    salary: 78500,
    grade: "A+",
    status: "normal",
  }),
  employeeBase(2, {
    id: "emp-002",
    name: "Marcus Webb",
    departmentId: "recruiting",
    birthday: "1988-11-22",
    joinedDate: "2020-01-15",
    shift: "afternoon",
    salary: 72000,
    grade: "A",
    status: "normal",
  }),
  employeeBase(3, {
    id: "emp-003",
    name: "Elena Rodriguez",
    departmentId: "recruiting",
    birthday: "1994-07-08",
    joinedDate: "2021-09-20",
    shift: "morning",
    salary: 68000,
    grade: "A-",
    status: "normal",
  }),
  employeeBase(4, {
    id: "emp-004",
    name: "James Okonkwo",
    departmentId: "operations",
    birthday: "1985-02-28",
    joinedDate: "2018-04-11",
    shift: "night",
    salary: 81000,
    grade: "B+",
    status: "close_monitor",
  }),
  employeeBase(5, {
    id: "emp-005",
    name: "Priya Sharma",
    departmentId: "sales",
    birthday: "1992-12-05",
    joinedDate: "2022-03-07",
    shift: "flexible",
    salary: 65000,
    grade: "B",
    status: "normal",
  }),
  employeeBase(6, {
    id: "emp-006",
    name: "David Kim",
    departmentId: "logistics",
    birthday: "1990-09-17",
    joinedDate: "2019-11-30",
    shift: "morning",
    salary: 74000,
    grade: "B-",
    status: "normal",
  }),
  employeeBase(7, {
    id: "emp-007",
    name: "Amara Diallo",
    departmentId: "hr",
    birthday: "1996-01-30",
    joinedDate: "2023-06-12",
    shift: "afternoon",
    salary: 58000,
    grade: "C+",
    status: "close_monitor",
  }),
  employeeBase(8, {
    id: "emp-008",
    name: "Thomas Berg",
    departmentId: "recruiting",
    birthday: "1987-05-19",
    joinedDate: "2017-08-22",
    shift: "morning",
    salary: 92000,
    grade: "A",
    status: "normal",
  }),
  employeeBase(9, {
    id: "emp-009",
    name: "Lisa Nakamura",
    departmentId: "operations",
    birthday: "1993-10-03",
    joinedDate: "2021-02-14",
    shift: "afternoon",
    salary: 67000,
    grade: "C",
    status: "normal",
  }),
  employeeBase(10, {
    id: "emp-010",
    name: "Robert Hayes",
    departmentId: "sales",
    birthday: "1984-08-25",
    joinedDate: "2016-05-09",
    shift: "morning",
    salary: 88000,
    grade: "B+",
    status: "close_monitor",
  }),
  employeeBase(11, {
    id: "emp-011",
    name: "Fatima Al-Rashid",
    departmentId: "logistics",
    birthday: "1995-04-12",
    joinedDate: "2022-11-01",
    shift: "night",
    salary: 61000,
    grade: "D+",
    status: "close_monitor",
  }),
  employeeBase(12, {
    id: "emp-013",
    name: "Nina Volkov",
    departmentId: "hr",
    birthday: "1993-08-21",
    joinedDate: "2021-04-19",
    shift: "flexible",
    salary: 71000,
    grade: "B+",
    status: "normal",
  }),
  employeeBase(13, {
    id: "emp-012",
    name: "Chris Palmer",
    departmentId: "recruiting",
    birthday: "1989-06-07",
    joinedDate: "2020-07-28",
    shift: "flexible",
    salary: 70000,
    grade: "A-",
    status: "normal",
  }),
];
