import type { CompanyCode } from "@/lib/types";

export const COMPANIES: { code: CompanyCode; label: string }[] = [
  { code: "JM", label: "Joshua Muziller LLC" },
  { code: "BP", label: "Bipolar Bear Enterprise LLC" },
  { code: "WF", label: "Wildfire Express LLC" },
];

export const COMPANY_CODES = COMPANIES.map((company) => company.code);

export function getCompanyLabel(code: string): string {
  return COMPANIES.find((company) => company.code === code)?.label ?? code;
}
