/**
 * Attendance display rules (Admin + Client Portal):
 * - Shift date = sheet column F; overnight 18:00→03:00 Tashkent stays on one shift date.
 * - Break is an event type only — never a day badge (map break status → Checked in).
 * - Late when late_minutes > 0.
 * - Backend: parse Time Local as Asia/Tashkent → store UTC; AttendanceNormalizer must not
 *   emit break as day status when check-in exists.
 */
import type { AttendanceDay, AttendanceDayStatus, AttendanceEventRecord } from "@/lib/types";

/** Face ID desk clock vs business logistics calendar. */
export type AttendanceTimezone = "Asia/Tashkent" | "America/Chicago";

export const ATTENDANCE_TIMEZONES: AttendanceTimezone[] = [
  "Asia/Tashkent",
  "America/Chicago",
];

export const ATTENDANCE_TIMEZONE_LABELS: Record<AttendanceTimezone, string> = {
  "Asia/Tashkent": "Tashkent (Face ID)",
  "America/Chicago": "US Central",
};

/** Employee-facing day badges — never includes break. */
export type AttendanceDisplayStatus =
  | "checked_in"
  | "late"
  | "no_show"
  | "excused"
  | "pending_review";

const DISPLAY_STATUS_LABELS: Record<AttendanceDisplayStatus, string> = {
  checked_in: "Checked in",
  late: "Late",
  no_show: "No show",
  excused: "Excused",
  pending_review: "Pending review",
};

const DISPLAY_STATUS_TONE: Record<AttendanceDisplayStatus, string> = {
  checked_in: "text-success",
  late: "text-warning",
  no_show: "text-danger",
  excused: "text-success",
  pending_review: "text-warning",
};

export type AttendanceEventKind = "check_in" | "check_out" | "break" | "other";

export function parseEventKind(action: string): AttendanceEventKind {
  const normalized = action.trim().toLowerCase();
  if (/break/.test(normalized)) return "break";
  if (/check.?in|checked in|entered/.test(normalized)) return "check_in";
  if (/check.?out|checked out|exited/.test(normalized)) return "check_out";
  return "other";
}

/** Map raw API day status to a display badge (break → checked in when punched). */
export function resolveDisplayDayStatus(
  day: Pick<AttendanceDay, "status" | "late_minutes" | "no_show">,
): AttendanceDisplayStatus {
  if (day.no_show || day.status === "no_show") return "no_show";
  if (day.status === "excused") return "excused";
  if (day.status === "pending_review" || day.status === "missing_punch") {
    return "pending_review";
  }
  if (day.late_minutes > 0 || day.status === "late") return "late";
  return "checked_in";
}

export function resolveDisplayStatusFromRaw(
  status: AttendanceDayStatus | null | undefined,
  lateMinutes = 0,
  noShow = false,
): AttendanceDisplayStatus | null {
  if (!status && !noShow && lateMinutes === 0) return null;
  return resolveDisplayDayStatus({
    status: status ?? "pending_review",
    late_minutes: lateMinutes,
    no_show: noShow,
  });
}

export function displayStatusLabel(status: AttendanceDisplayStatus): string {
  return DISPLAY_STATUS_LABELS[status];
}

export function displayStatusTone(status: AttendanceDisplayStatus): string {
  return DISPLAY_STATUS_TONE[status];
}

/** Admin correction options — break is an event type, not a day status. */
export const ADMIN_DAY_STATUS_OPTIONS: {
  value: AttendanceDayStatus;
  label: string;
}[] = [
  { value: "present", label: "Checked in" },
  { value: "late", label: "Late" },
  { value: "no_show", label: "No show" },
  { value: "excused", label: "Excused" },
  { value: "pending_review", label: "Pending review" },
  { value: "missing_punch", label: "Missing punch" },
];

export const ADMIN_DAY_FILTER_OPTIONS: {
  value: AttendanceDayStatus | "";
  label: string;
}[] = [
  { value: "", label: "All statuses" },
  ...ADMIN_DAY_STATUS_OPTIONS,
];

export function formatAttendanceClock(
  iso: string | null | undefined,
  timezone: AttendanceTimezone,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatAttendanceTimeOnly(
  iso: string | null | undefined,
  timezone: AttendanceTimezone,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export type ParsedDayEvents = {
  checkIn: AttendanceEventRecord | null;
  checkOut: AttendanceEventRecord | null;
  breaks: AttendanceEventRecord[];
  workEvents: AttendanceEventRecord[];
  shiftWindow: string | null;
};

export function parseDayEvents(
  events: AttendanceEventRecord[] | undefined,
): ParsedDayEvents {
  const list = events ?? [];
  const breaks: AttendanceEventRecord[] = [];
  const workEvents: AttendanceEventRecord[] = [];

  for (const event of list) {
    const kind = event.event_kind ?? parseEventKind(event.action);
    if (kind === "break") breaks.push(event);
    else workEvents.push(event);
  }

  const checkIn =
    workEvents.find(
      (event) => (event.event_kind ?? parseEventKind(event.action)) === "check_in",
    ) ?? null;
  const checkOut = [...workEvents]
    .reverse()
    .find(
      (event) => (event.event_kind ?? parseEventKind(event.action)) === "check_out",
    ) ?? null;

  const shiftWindow =
    checkIn?.shift ??
    checkOut?.shift ??
    workEvents.find((event) => event.shift)?.shift ??
    null;

  return { checkIn, checkOut, breaks, workEvents, shiftWindow };
}

export function countLateDays(days: AttendanceDay[]): number {
  return days.filter(
    (day) => day.late_minutes > 0 || day.status === "late",
  ).length;
}

export function countNoShowDays(days: AttendanceDay[]): number {
  return days.filter((day) => day.no_show || day.status === "no_show").length;
}

export function countCheckedInDays(days: AttendanceDay[]): number {
  return days.filter(
    (day) =>
      resolveDisplayDayStatus(day) === "checked_in" ||
      resolveDisplayDayStatus(day) === "late",
  ).length;
}

export type AttendanceSummaryStats = {
  checkedIn: number;
  late: number;
  noShow: number;
  pending: number;
  missingPunch: number;
  totalDayRows: number;
  uniqueEmployees: number;
};

export function summarizeAttendanceDays(
  days: AttendanceDay[],
): AttendanceSummaryStats {
  const names = new Set<string>();
  let pending = 0;
  let missingPunch = 0;

  for (const day of days) {
    if (day.employee_name) names.add(day.employee_name);
    const display = resolveDisplayDayStatus(day);
    if (display === "pending_review") pending += 1;
    if (day.status === "missing_punch") missingPunch += 1;
  }

  return {
    checkedIn: countCheckedInDays(days),
    late: countLateDays(days),
    noShow: countNoShowDays(days),
    pending,
    missingPunch,
    totalDayRows: days.length,
    uniqueEmployees: names.size,
  };
}
