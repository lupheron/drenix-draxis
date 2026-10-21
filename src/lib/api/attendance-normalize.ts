import type {
  AttendanceDay,
  AttendanceDayStatus,
  AttendanceEventRecord,
  AttendanceRequest,
  CompanyCode,
} from "@/lib/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    return lower === "1" || lower === "true" || lower === "yes";
  }
  return false;
}

function nestedPerson(
  raw: Record<string, unknown>,
): Record<string, unknown> | null {
  return (
    asRecord(raw.employee) ??
    asRecord(raw.user) ??
    asRecord(raw.staff) ??
    null
  );
}

function nameFromPerson(person: Record<string, unknown> | null): string | null {
  if (!person) return null;
  const first = asString(person.first_name);
  const last = asString(person.last_name);
  const combined = [first, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  return (
    asString(person.name) ??
    asString(person.full_name) ??
    asString(person.employee_name) ??
    null
  );
}

const DAY_STATUSES: AttendanceDayStatus[] = [
  "present",
  "late",
  "no_show",
  "break",
  "missing_punch",
  "excused",
  "pending_review",
];

function asDayStatus(value: unknown): AttendanceDayStatus {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (DAY_STATUSES.includes(raw as AttendanceDayStatus)) {
    return raw as AttendanceDayStatus;
  }
  if (raw === "checked_in" || raw === "on_time") return "present";
  if (raw === "absent") return "no_show";
  return "present";
}

function asCompany(value: unknown): CompanyCode {
  const code = String(value ?? "JM")
    .trim()
    .toUpperCase();
  if (code === "JM" || code === "BP" || code === "WF") return code;
  return "JM";
}

function normalizeEvents(raw: unknown): AttendanceEventRecord[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((item, index) => {
    const event = asRecord(item) ?? {};
    return {
      id: asNumber(event.id) || index + 1,
      employee_id: asNumber(
        event.employee_id ?? event.user_id ?? nestedPerson(event)?.id,
      ),
      company: asCompany(event.company),
      occurred_at: asString(event.occurred_at) ?? "",
      action: asString(event.action) ?? "",
      event_kind:
        event.event_kind === "check_in" ||
        event.event_kind === "check_out" ||
        event.event_kind === "break" ||
        event.event_kind === "other"
          ? event.event_kind
          : undefined,
      shift: asString(event.shift),
      sheet_note: asString(event.sheet_note),
      late_minutes:
        event.late_minutes == null ? null : asNumber(event.late_minutes),
      source: event.source === "manual" ? "manual" : "sheet",
    };
  });
}

/**
 * Laravel may send user_id, nested employee/user, or blank employee_name.
 * Normalize every day row before UI / search uses it.
 */
export function normalizeAttendanceDay(rawInput: unknown): AttendanceDay {
  const raw = asRecord(rawInput) ?? {};
  const person = nestedPerson(raw);
  const employeeId = asNumber(
    raw.employee_id ?? raw.user_id ?? person?.id ?? raw.staff_id,
  );
  const employeeName =
    asString(raw.employee_name) ??
    asString(raw.name) ??
    asString(raw.full_name) ??
    nameFromPerson(person) ??
    (typeof raw.employee === "string" ? asString(raw.employee) : null);

  return {
    id: asNumber(raw.id),
    employee_id: employeeId,
    employee_name: employeeName,
    company: asCompany(raw.company),
    date: (asString(raw.date) ?? asString(raw.shift_date) ?? "").slice(0, 10),
    status: asDayStatus(raw.status),
    late_minutes: asNumber(raw.late_minutes),
    no_show: asBool(raw.no_show),
    sheet_note: asString(raw.sheet_note),
    admin_note: asString(raw.admin_note),
    corrected_by: asRecord(raw.corrected_by)
      ? {
          id: asNumber((raw.corrected_by as Record<string, unknown>).id),
          username:
            asString((raw.corrected_by as Record<string, unknown>).username) ??
            "",
        }
      : null,
    corrected_at: asString(raw.corrected_at),
    events: normalizeEvents(raw.events),
  };
}

export function normalizeAttendanceDays(raw: unknown): AttendanceDay[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeAttendanceDay);
}

export function normalizeAttendanceRequest(
  rawInput: unknown,
): AttendanceRequest {
  const raw = asRecord(rawInput) ?? {};
  const person = nestedPerson(raw);
  return {
    id: asNumber(raw.id),
    type: raw.type === "absence" ? "absence" : "dispute",
    status:
      raw.status === "approved" ||
      raw.status === "rejected" ||
      raw.status === "pending"
        ? raw.status
        : "pending",
    employee_id: asNumber(
      raw.employee_id ?? raw.user_id ?? person?.id ?? raw.staff_id,
    ),
    employee_name:
      asString(raw.employee_name) ??
      asString(raw.name) ??
      nameFromPerson(person),
    company: asCompany(raw.company),
    date: (asString(raw.date) ?? "").slice(0, 10),
    message: asString(raw.message) ?? "",
    admin_comment: asString(raw.admin_comment),
    related_day_id:
      raw.related_day_id == null ? null : asNumber(raw.related_day_id),
    reviewed_by: asRecord(raw.reviewed_by)
      ? {
          id: asNumber((raw.reviewed_by as Record<string, unknown>).id),
          username:
            asString((raw.reviewed_by as Record<string, unknown>).username) ??
            "",
        }
      : null,
    reviewed_at: asString(raw.reviewed_at),
    created_at: asString(raw.created_at) ?? "",
    updated_at: asString(raw.updated_at) ?? "",
  };
}

export function normalizeAttendanceRequests(raw: unknown): AttendanceRequest[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeAttendanceRequest);
}
