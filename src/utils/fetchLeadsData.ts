import type { LeadsDataRow, LeadsFetchResult } from "@/types/leads";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const MOCK_LEADS_DATA: LeadsDataRow[] = [
  {
    month: "Jan 2026",
    leads: 399,
    hired: 17,
    hired_by_leads: 12,
    hired_by_leadbase: 2,
    hired_by_referral: 3,
    hire_rate_pct: 4.3,
    ad_spend_usd: 1826,
    high_band: 400,
    normal_band: 320,
    low_band: 224,
  },
  {
    month: "Feb 2026",
    leads: 454,
    hired: 15,
    hired_by_leads: 4,
    hired_by_leadbase: 2,
    hired_by_referral: 9,
    hire_rate_pct: 3.3,
    ad_spend_usd: 1616,
    high_band: 400,
    normal_band: 320,
    low_band: 224,
  },
  {
    month: "Mar 2026",
    leads: 506,
    hired: 16,
    hired_by_leads: 7,
    hired_by_leadbase: 1,
    hired_by_referral: 8,
    hire_rate_pct: 3.2,
    ad_spend_usd: 1485,
    high_band: 400,
    normal_band: 320,
    low_band: 224,
  },
];

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function monthLabel(monthIndex: number): string {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
  const label = MONTH_LABELS[monthIndex - 1] ?? `M${monthIndex}`;
  return `${label} ${year}`;
}

function parseMonthIndex(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(String(raw).trim());
  if (!Number.isFinite(value) || value < 1 || value > 12) return null;
  return Math.round(value);
}

function parseNumber(raw: unknown): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
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

function applyPerformanceBands(rows: LeadsDataRow[]): LeadsDataRow[] {
  if (rows.length === 0) return rows;
  const avgLeads = rows.reduce((sum, row) => sum + row.leads, 0) / rows.length;
  const normal = Math.round(avgLeads);
  const high = Math.round(avgLeads * 1.25);
  const low = Math.round(avgLeads * 0.7);
  return rows.map((row) => ({
    ...row,
    high_band: high,
    normal_band: normal,
    low_band: low,
  }));
}

function parseGvizResponse(text: string): LeadsDataRow[] {
  const jsonText = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1");
  const payload = JSON.parse(jsonText) as {
    table?: {
      cols: Array<{ label?: string }>;
      rows: Array<{ c: Array<{ v: unknown } | null> }>;
    };
  };

  const table = payload.table;
  if (!table) return [];

  const monthIdx = findColumnIndex(table.cols, ["Month"]);
  const leadsIdx = findColumnIndex(table.cols, ["Total Leads"]);
  const hiredIdx = findColumnIndex(table.cols, ["Hired Total"]);
  const hiredLeadsIdx = findColumnIndex(table.cols, ["Hired by Leads"]);
  const hiredLbIdx = findColumnIndex(table.cols, ["Hired by Lead Base"]);
  const hiredRefIdx = findColumnIndex(table.cols, ["Hired by Referral"]);
  const spendIdx = findColumnIndex(table.cols, ["Amount Spent"]);

  const rows: LeadsDataRow[] = [];

  for (const row of table.rows) {
    const cells = row.c ?? [];
    const monthIndex = parseMonthIndex(cells[monthIdx]?.v);
    if (!monthIndex) continue;

    const leads = parseNumber(cells[leadsIdx]?.v);
    if (leads === 0) continue;

    const hired = parseNumber(cells[hiredIdx]?.v);
    const hiredByLeads = parseNumber(cells[hiredLeadsIdx]?.v);
    const hiredByLeadBase = parseNumber(cells[hiredLbIdx]?.v);
    const hiredByReferral = parseNumber(cells[hiredRefIdx]?.v);

    rows.push({
      month: monthLabel(monthIndex),
      leads,
      hired,
      hired_by_leads: hiredByLeads,
      hired_by_leadbase: hiredByLeadBase,
      hired_by_referral: hiredByReferral,
      hire_rate_pct: round((hired / leads) * 100),
      ad_spend_usd: parseNumber(cells[spendIdx]?.v),
      high_band: 0,
      normal_band: 0,
      low_band: 0,
    });
  }

  return applyPerformanceBands(rows);
}

export function resolveJmLeadsSheetId(): string | undefined {
  return (
    process.env.LEADS_SHEET_JM_ID ??
    process.env.LEADS_SHEET_ID ??
    undefined
  );
}

export async function fetchLeadsData(
  sheetId?: string,
): Promise<LeadsFetchResult> {
  const id = sheetId ?? resolveJmLeadsSheetId();
  if (!id) {
    return { data: MOCK_LEADS_DATA };
  }

  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=Main`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Sheet request failed (${response.status})`);
    }

    const text = await response.text();
    const data = parseGvizResponse(text);
    if (data.length === 0) {
      throw new Error("No rows with leads found in Main tab");
    }

    return { data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sheet data";
    return { data: MOCK_LEADS_DATA, error: message };
  }
}
