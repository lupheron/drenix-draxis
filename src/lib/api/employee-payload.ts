import type {
  CompanyCode,
  DailyMetric,
  Employee,
  EmployeeMetrics,
  EmployeePayload,
} from "@/lib/types";
import { COMPANIES } from "@/constants/companies";

function metricNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeRingCentralSummary(
  raw: unknown,
): EmployeeMetrics["ringcentral"] {
  if (raw == null || typeof raw !== "object") return undefined;
  const m = raw as Record<string, unknown>;
  return {
    total_calls: metricNumber(m.total_calls),
    outbound: metricNumber(m.outbound),
    inbound: metricNumber(m.inbound),
    missed: metricNumber(m.missed),
    voicemail: metricNumber(m.voicemail),
    other: metricNumber(m.other),
    minutes_total: metricNumber(m.minutes_total),
    minutes_outbound: metricNumber(m.minutes_outbound),
    minutes_inbound: metricNumber(m.minutes_inbound),
    date:
      m.date === null || m.date === undefined
        ? null
        : String(m.date).slice(0, 10),
  };
}

export function normalizeMetrics(raw: unknown): EmployeeMetrics | undefined {
  if (raw == null || typeof raw !== "object") return undefined;
  const m = raw as Record<string, unknown>;
  return {
    minutes_on_call: metricNumber(m.minutes_on_call),
    calls_made: metricNumber(m.calls_made),
    outbound_calls: metricNumber(m.outbound_calls),
    inbound_calls: metricNumber(m.inbound_calls),
    missed_calls: metricNumber(m.missed_calls),
    voicemail_calls: metricNumber(m.voicemail_calls),
    other_calls: metricNumber(m.other_calls),
    outbound_minutes: metricNumber(m.outbound_minutes),
    inbound_minutes: metricNumber(m.inbound_minutes),
    lates: metricNumber(m.lates),
    leads: metricNumber(m.leads),
    follow_up: metricNumber(m.follow_up),
    hires: metricNumber(m.hires),
    loaded: metricNumber(m.loaded),
    rejected: metricNumber(m.rejected),
    ringcentral: normalizeRingCentralSummary(m.ringcentral),
  };
}

export function normalizeDailyMetric(row: Record<string, unknown> & { date?: string }): DailyMetric {
  const metrics = normalizeMetrics(row) ?? {
    minutes_on_call: 0,
    calls_made: 0,
    outbound_calls: 0,
    inbound_calls: 0,
    missed_calls: 0,
    voicemail_calls: 0,
    other_calls: 0,
    outbound_minutes: 0,
    inbound_minutes: 0,
    lates: 0,
    leads: 0,
    follow_up: 0,
    hires: 0,
    loaded: 0,
    rejected: 0,
  };

  return {
    ...metrics,
    date: String(row.date ?? "").slice(0, 10),
  };
}

export function normalizeCompanyCode(value: unknown): CompanyCode {
  if (value == null || value === "") {
    return "JM";
  }

  if (typeof value === "object" && value !== null && "code" in value) {
    return normalizeCompanyCode((value as { code: unknown }).code);
  }

  const raw = String(value).trim();
  const upper = raw.toUpperCase();

  if (upper === "JM" || upper === "WF" || upper === "BP") {
    return upper;
  }

  const byLabel = COMPANIES.find(
    (company) => company.label.toLowerCase() === raw.toLowerCase(),
  );
  if (byLabel) {
    return byLabel.code;
  }

  const byCode = COMPANIES.find(
    (company) => company.code.toLowerCase() === raw.toLowerCase(),
  );
  if (byCode) {
    return byCode.code;
  }

  return "JM";
}

export function normalizeDepartmentSlug(value: unknown): "hr" | "safety" {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  if (raw === "safety") {
    return "safety";
  }

  if (
    raw === "hr" ||
    raw === "human resources" ||
    raw === "human-resources" ||
    raw === "human_resources"
  ) {
    return "hr";
  }

  return "hr";
}

function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export function normalizeEmployeePayload(
  payload: EmployeePayload,
): EmployeePayload {
  return {
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    birth_date: payload.birth_date.slice(0, 10),
    joined_at: payload.joined_at.slice(0, 10),
    shift: payload.shift,
    salary: Number(payload.salary),
    grade: payload.grade.trim(),
    status: payload.status,
    department: normalizeDepartmentSlug(payload.department),
    company: normalizeCompanyCode(payload.company),
    phone: emptyToNull(payload.phone),
    email: emptyToNull(payload.email),
    address: emptyToNull(payload.address),
    city: emptyToNull(payload.city),
    state: emptyToNull(payload.state),
    country: emptyToNull(payload.country),
    gender: emptyToNull(payload.gender),
    position: emptyToNull(payload.position),
  };
}

export function mapApiEmployee(raw: Record<string, unknown>): Employee {
  return {
    id: Number(raw.id),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    birth_date: String(raw.birth_date ?? "").slice(0, 10),
    joined_at: String(raw.joined_at ?? "").slice(0, 10),
    shift: raw.shift as Employee["shift"],
    salary:
      raw.salary !== undefined && raw.salary !== null
        ? Number(raw.salary)
        : undefined,
    grade: String(raw.grade ?? ""),
    status: raw.status as Employee["status"],
    department: normalizeDepartmentSlug(raw.department),
    company: normalizeCompanyCode(raw.company),
    phone: raw.phone != null ? String(raw.phone) : null,
    email: raw.email != null ? String(raw.email) : null,
    address: raw.address != null ? String(raw.address) : null,
    city: raw.city != null ? String(raw.city) : null,
    state: raw.state != null ? String(raw.state) : null,
    country: raw.country != null ? String(raw.country) : null,
    gender: raw.gender != null ? String(raw.gender) : null,
    position: raw.position != null ? String(raw.position) : null,
    metrics: normalizeMetrics(raw.metrics),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}
