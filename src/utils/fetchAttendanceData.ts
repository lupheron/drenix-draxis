import type { CompanyCode } from "@/lib/types";
import type {
  AttendanceEvent,
  AttendanceFetchResult,
  AttendancePersonSummary,
  AttendanceSummary,
} from "@/types/attendance";

const COMPANY_TABS: Record<CompanyCode, string> = {
  JM: "JM",
  BP: "BP",
  WF: "WF",
};

function cellValue(cell: { v: unknown; f?: string } | null | undefined): string {
  if (!cell) return "";
  if (typeof cell.f === "string" && cell.f.trim()) return cell.f.trim();
  if (cell.v === null || cell.v === undefined) return "";
  return String(cell.v).trim();
}

function parseLateMinutes(notes: string): number | null {
  const match =
    notes.match(/(\d+)\s*Very late/i) ??
    notes.match(/Late\s*\((\d+)\s*min\)/i) ??
    notes.match(/(\d+)\s*Late/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function normalizeAction(raw: string): string {
  return raw.trim();
}

function isNoShow(action: string, notes: string, flagged: boolean): boolean {
  const haystack = `${action} ${notes}`.toLowerCase();
  return flagged || haystack.includes("no show");
}

function isLate(notes: string, lateMinutes: number | null): boolean {
  if (lateMinutes !== null && lateMinutes > 0) return true;
  return /late/i.test(notes);
}

function isCheckIn(action: string): boolean {
  return /checked in|entered/i.test(action.toLowerCase());
}

function isCheckOut(action: string): boolean {
  return /checked out|exited/i.test(action.toLowerCase());
}

function findColumnIndex(
  cols: Array<{ label?: string }>,
  labels: string[],
): number {
  const normalized = labels.map((label) => label.toLowerCase());
  return cols.findIndex((col) =>
    normalized.includes((col.label ?? "").trim().toLowerCase()),
  );
}

function parseDateOnly(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const iso = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function eventInRange(date: string, from: string, to: string): boolean {
  if (!date) return false;
  return date >= from && date <= to;
}

function buildSummary(events: AttendanceEvent[]): AttendanceSummary {
  const byPersonMap = new Map<string, AttendancePersonSummary>();

  for (const event of events) {
    const key = event.name.trim() || "Unknown";
    const current = byPersonMap.get(key) ?? {
      name: key,
      events: 0,
      noShows: 0,
      lates: 0,
      flagged: 0,
    };
    current.events += 1;
    if (event.isNoShow) current.noShows += 1;
    if (event.lateMinutes !== null && event.lateMinutes > 0) current.lates += 1;
    if (event.flagged) current.flagged += 1;
    byPersonMap.set(key, current);
  }

  return {
    totalEvents: events.length,
    checkIns: events.filter((event) => isCheckIn(event.action)).length,
    checkOuts: events.filter((event) => isCheckOut(event.action)).length,
    noShows: events.filter((event) => event.isNoShow).length,
    lates: events.filter(
      (event) => event.lateMinutes !== null && event.lateMinutes > 0,
    ).length,
    flagged: events.filter((event) => event.flagged).length,
    byPerson: [...byPersonMap.values()].sort(
      (a, b) => b.noShows - a.noShows || b.lates - a.lates || b.events - a.events,
    ),
  };
}

function parseGvizAttendance(text: string): AttendanceEvent[] {
  const jsonText = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1");
  const payload = JSON.parse(jsonText) as {
    table?: {
      cols: Array<{ label?: string }>;
      rows: Array<{ c: Array<{ v: unknown; f?: string } | null> }>;
    };
  };

  const table = payload.table;
  if (!table) return [];

  const timestampIdx = findColumnIndex(table.cols, [
    "timestamp",
    "time",
    "datetime",
    "date time",
  ]);
  const nameIdx = findColumnIndex(table.cols, ["name", "employee", "person"]);
  const actionIdx = findColumnIndex(table.cols, ["action", "event", "status"]);
  const shiftIdx = findColumnIndex(table.cols, ["shift"]);
  const dateIdx = findColumnIndex(table.cols, ["date"]);
  const notesIdx = findColumnIndex(table.cols, [
    "notes",
    "note",
    "comment",
    "status note",
  ]);
  const flagIdx = findColumnIndex(table.cols, ["flag", "flagged", "violation"]);

  const usePositions = nameIdx < 0 && actionIdx < 0;

  const events: AttendanceEvent[] = [];

  table.rows.forEach((row, rowIndex) => {
    const cells = row.c ?? [];
    const read = (index: number) => cellValue(cells[index]);

    const name = usePositions ? read(2) : read(nameIdx >= 0 ? nameIdx : 2);
    const action = usePositions
      ? read(3)
      : read(actionIdx >= 0 ? actionIdx : 3);
    const shift = usePositions
      ? read(4) || null
      : read(shiftIdx >= 0 ? shiftIdx : 4) || null;
    const timestamp = usePositions
      ? read(0) || null
      : read(timestampIdx >= 0 ? timestampIdx : 0) || null;
    const dateRaw = usePositions ? read(5) : read(dateIdx >= 0 ? dateIdx : 5);
    const notes = usePositions
      ? read(7) || null
      : read(notesIdx >= 0 ? notesIdx : 7) || null;
    const flagRaw = usePositions ? read(9) : read(flagIdx >= 0 ? flagIdx : 9);

    if (!name && !action) return;
    if (/^name$/i.test(name) && /^action$/i.test(action)) return;

    const date =
      parseDateOnly(dateRaw) ??
      parseDateOnly(timestamp ?? "") ??
      "";
    if (!date && !timestamp) return;

    const notesText = notes ?? "";
    const lateMinutes = parseLateMinutes(notesText);
    const flagged = /^yes$/i.test(flagRaw.trim());
    const normalizedAction = normalizeAction(action);

    events.push({
      id: `${date}-${name}-${rowIndex}`,
      timestamp,
      name,
      action: normalizedAction,
      shift,
      date: date || parseDateOnly(timestamp ?? "") || "",
      notes,
      flagged,
      lateMinutes,
      isNoShow: isNoShow(normalizedAction, notesText, flagged),
    });
  });

  return events;
}

export function resolveAttendanceSheetId(): string | undefined {
  return process.env.ATTENDANCE_SHEET_ID ?? undefined;
}

export function resolveAttendanceTab(company: CompanyCode): string {
  return COMPANY_TABS[company] ?? company;
}

export async function fetchAttendanceData(
  company: CompanyCode,
  from: string,
  to: string,
  sheetId?: string,
): Promise<AttendanceFetchResult> {
  const id = sheetId ?? resolveAttendanceSheetId();
  const sheetTab = resolveAttendanceTab(company);

  if (!id) {
    return {
      company,
      sheetTab,
      data: [],
      summary: buildSummary([]),
      error: "ATTENDANCE_SHEET_ID is not configured",
    };
  }

  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetTab)}`;

  try {
    const response = await fetch(url, { next: { revalidate: 120 } });
    if (!response.ok) {
      throw new Error(`Sheet request failed (${response.status})`);
    }

    const text = await response.text();
    if (text.trimStart().startsWith("<!DOCTYPE") || text.includes("<html")) {
      throw new Error(
        "Sheet is not public. Share it as “Anyone with the link → Viewer”.",
      );
    }

    const parsed = parseGvizAttendance(text);
    const filtered = parsed.filter((event) =>
      eventInRange(event.date, from, to),
    );

    return {
      company,
      sheetTab,
      data: filtered.sort((a, b) =>
        `${b.date}${b.timestamp ?? ""}`.localeCompare(
          `${a.date}${a.timestamp ?? ""}`,
        ),
      ),
      summary: buildSummary(filtered),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load attendance sheet";
    return {
      company,
      sheetTab,
      data: [],
      summary: buildSummary([]),
      error: message,
    };
  }
}
