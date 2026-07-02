import type { Employee, EmployeeCharge, UserPayload } from "@/types/staff";
import { SHIFT_TIMES } from "@/constants/staff-options";

type LaravelUser = {
  id: number | string;
  first_name: string;
  last_name: string;
  birth_date: string;
  joined_at: string;
  shift: string;
  salary: number | string;
  grade: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  department: string;
  position?: string | null;
  company?: string | null;
  daily_logs?: LaravelDailyLog[];
  charge_entries?: LaravelCharge[];
};

type LaravelDailyLog = {
  date: string;
  attendance: string;
  calls_made: number;
  hours_worked: number;
  minutes_on_call: number;
  recordings_count: number;
  hires: number;
  leads: number;
  follow_up: number;
  reject: number;
  hired: number;
  on_process: number;
  break_warnings: number;
};

type LaravelCharge = {
  id: number | string;
  employee_id?: number | string;
  user_id?: number | string;
  date: string;
  amount: number | string;
  description?: string | null;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeDate(value: string): string {
  return value.slice(0, 10);
}

export function userPayloadToLaravel(payload: UserPayload) {
  return {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    birth_date: payload.birthDate,
    joined_at: payload.joinedAt,
    shift: payload.shift,
    salary: payload.salary,
    grade: payload.grade,
    status: payload.status,
    phone: emptyToNull(payload.phone),
    email: emptyToNull(payload.email),
    address: emptyToNull(payload.address),
    city: emptyToNull(payload.city),
    state: emptyToNull(payload.state),
    country: emptyToNull(payload.country),
    gender: emptyToNull(payload.gender),
    department: payload.department,
    position: emptyToNull(payload.position),
    company: emptyToNull(payload.company),
  };
}

export function laravelUserToEmployee(user: LaravelUser): Employee {
  const shift = user.shift as Employee["shift"];

  return {
    id: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    birthDate: normalizeDate(user.birth_date),
    joinedAt: normalizeDate(user.joined_at),
    shift,
    shiftTime: SHIFT_TIMES[shift] ?? user.shift,
    salary: Number(user.salary),
    grade: user.grade as Employee["grade"],
    status: user.status as Employee["status"],
    phone: user.phone ?? "",
    email: user.email ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    country: user.country ?? "",
    gender: user.gender ?? "",
    department: user.department,
    position: user.position ?? "",
    company: user.company ?? "",
    dailyLogs: (user.daily_logs ?? []).map((log) => ({
      date: log.date,
      attendance: log.attendance as Employee["dailyLogs"][number]["attendance"],
      callsMade: log.calls_made,
      hoursWorked: log.hours_worked,
      minutesOnCall: log.minutes_on_call,
      recordingsCount: log.recordings_count,
      hires: log.hires,
      leads: log.leads,
      followUp: log.follow_up,
      reject: log.reject,
      hired: log.hired,
      onProcess: log.on_process,
      breakWarnings: log.break_warnings,
    })),
    chargeEntries: (user.charge_entries ?? []).map((charge) => ({
      id: String(charge.id),
      employeeId: String(charge.employee_id ?? charge.user_id ?? user.id),
      date: charge.date,
      amount: Number(charge.amount),
      description: charge.description ?? undefined,
    })),
  };
}

export function laravelChargeToEmployeeCharge(
  charge: LaravelCharge,
  employeeId: string,
): EmployeeCharge {
  return {
    id: String(charge.id),
    employeeId,
    date: charge.date,
    amount: Number(charge.amount),
    description: charge.description ?? undefined,
  };
}

export function employeeToUserPayload(employee: Employee): UserPayload {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    birthDate: employee.birthDate,
    joinedAt: employee.joinedAt,
    shift: employee.shift,
    salary: employee.salary,
    grade: employee.grade,
    status: employee.status,
    phone: employee.phone,
    email: employee.email,
    address: employee.address,
    city: employee.city,
    state: employee.state,
    country: employee.country,
    gender: employee.gender,
    department: employee.department,
    position: employee.position,
    company: employee.company,
  };
}
