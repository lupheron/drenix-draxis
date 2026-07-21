import type { LeadsDataRow } from "@/types/leads";

export type ForecastRow = {
  month: string;
  leads: number;
  hiredLeads: number;
  hiredLB: number;
  hiredRef: number;
  totalHired: number;
  leadsRate: string;
  lbRate: string;
  overallRate: string;
  adSpend: string;
  cphLeads: string;
  cphLB: string;
  _leads: number;
  _adSpend: number;
  _leadsRate: number;
  _lbRate: number;
  _overallRate: number;
  _cphLeads: number;
  _cphLB: number;
};

function weightedAvg(values: number[], weights: number[]): number {
  return values.reduce((sum, value, index) => sum + value * weights[index], 0);
}

function slope(values: number[]): number {
  if (values.length <= 1) return 0;
  return (values[values.length - 1] - values[0]) / (values.length - 1);
}

function nextMonthLabel(current: string, offset: number): string {
  const months = [
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
  ];
  const [monthName, yearText] = current.split(" ");
  let monthIndex = months.indexOf(monthName) + offset;
  let year = parseInt(yearText, 10);
  while (monthIndex >= 12) {
    monthIndex -= 12;
    year += 1;
  }
  return `${months[monthIndex]} ${year}`;
}

export function buildForecast(data: LeadsDataRow[]): ForecastRow[] {
  if (data.length === 0) return [];

  const recent = data.slice(-4);
  const rawWeights = [0.1, 0.2, 0.3, 0.4].slice(4 - recent.length);
  const weightSum = rawWeights.reduce((sum, weight) => sum + weight, 0);
  const weights = rawWeights.map((weight) => weight / weightSum);

  const leadsRates = recent.map((row) =>
    row.leads > 0 ? (row.hired_by_leads / row.leads) * 100 : 0,
  );
  const lbRates = recent.map((row) =>
    row.leads > 0 ? (row.hired_by_leadbase / row.leads) * 100 : 0,
  );
  const overallRates = recent.map((row) => row.hire_rate_pct);

  const baseLeads = weightedAvg(
    recent.map((row) => row.leads),
    weights,
  );
  const baseSpend = weightedAvg(
    recent.map((row) => row.ad_spend_usd),
    weights,
  );
  const baseLeadsRate = weightedAvg(leadsRates, weights);
  const baseLbRate = weightedAvg(lbRates, weights);
  const baseOverallRate = weightedAvg(overallRates, weights);

  const leadsSlope = slope(recent.map((row) => row.leads));
  const spendSlope = slope(recent.map((row) => row.ad_spend_usd));
  const leadsRateSlope = slope(leadsRates);
  const lbRateSlope = slope(lbRates);
  const overallRateSlope = slope(overallRates);

  const last = data[data.length - 1];

  return [1, 2, 3].map((offset) => {
    const leads = Math.max(0, Math.round(baseLeads + leadsSlope * offset));
    const adSpend = Math.max(0, baseSpend + spendSlope * offset);
    const leadsRate = Math.max(0, baseLeadsRate + leadsRateSlope * offset);
    const lbRate = Math.max(0, baseLbRate + lbRateSlope * offset);
    const overallRate = Math.max(0, baseOverallRate + overallRateSlope * offset);
    const hiredLeads = Math.round((leads * leadsRate) / 100);
    const hiredLB = Math.round((leads * lbRate) / 100);
    const hiredRef = last.hired_by_referral ?? 0;
    const totalHired = hiredLeads + hiredLB + hiredRef;
    const cphLeads = hiredLeads > 0 ? adSpend / hiredLeads : 0;
    const cphLB = hiredLB > 0 ? adSpend / hiredLB : 0;

    return {
      month: nextMonthLabel(last.month, offset),
      leads,
      hiredLeads,
      hiredLB,
      hiredRef,
      totalHired,
      leadsRate: `${leadsRate.toFixed(1)}%`,
      lbRate: `${lbRate.toFixed(1)}%`,
      overallRate: `${overallRate.toFixed(1)}%`,
      adSpend: `$${adSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      cphLeads:
        hiredLeads > 0 ? `$${Math.round(cphLeads).toLocaleString()}` : "—",
      cphLB: hiredLB > 0 ? `$${Math.round(cphLB).toLocaleString()}` : "—",
      _leads: leads,
      _adSpend: adSpend,
      _leadsRate: leadsRate,
      _lbRate: lbRate,
      _overallRate: overallRate,
      _cphLeads: cphLeads,
      _cphLB: cphLB,
    };
  });
}
