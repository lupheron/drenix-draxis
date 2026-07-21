import type { LeadsDataRow } from "@/types/leads";

export function sumField(
  data: LeadsDataRow[],
  field: keyof LeadsDataRow,
): number {
  return data.reduce((sum, row) => sum + Number(row[field] ?? 0), 0);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function leadsOnlyRate(row: LeadsDataRow): number {
  return row.leads > 0 ? round((row.hired_by_leads / row.leads) * 100) : 0;
}

export function leadBaseRate(row: LeadsDataRow): number {
  return row.leads > 0 ? round((row.hired_by_leadbase / row.leads) * 100) : 0;
}

export function cphLeads(row: LeadsDataRow): number {
  return row.hired_by_leads > 0
    ? Math.round(row.ad_spend_usd / row.hired_by_leads)
    : 0;
}

export function cphOverall(row: LeadsDataRow): number {
  return row.hired > 0 ? Math.round(row.ad_spend_usd / row.hired) : 0;
}

export function periodSummary(data: LeadsDataRow[]) {
  const totalLeads = sumField(data, "leads");
  const totalHired = sumField(data, "hired");
  const hiredFromLeads = sumField(data, "hired_by_leads");
  const hiredFromLeadBase = sumField(data, "hired_by_leadbase");
  const hiredFromReferral = sumField(data, "hired_by_referral");
  const totalSpend = sumField(data, "ad_spend_usd");

  return {
    totalLeads,
    totalHired,
    hiredFromLeads,
    hiredFromLeadBase,
    hiredFromReferral,
    totalSpend,
    leadHireRate:
      totalLeads > 0 ? round((hiredFromLeads / totalLeads) * 100) : 0,
    overallRate:
      totalLeads > 0 ? round((totalHired / totalLeads) * 100) : 0,
    avgCostPerHire:
      hiredFromLeads > 0 ? Math.round(totalSpend / hiredFromLeads) : 0,
    avgLeadsPerMonth:
      data.length > 0 ? Math.round(totalLeads / data.length) : 0,
  };
}
