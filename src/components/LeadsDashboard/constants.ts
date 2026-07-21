export const SECTIONS = [
  { id: "overview", label: "Overview", icon: "◈", desc: "KPIs & monthly data" },
  { id: "forecast", label: "Forecast", icon: "◎", desc: "3-month projection" },
  {
    id: "performance",
    label: "Lead Performance",
    icon: "▲",
    desc: "Leads & hire rate trends",
  },
  {
    id: "hire-rates",
    label: "Hire Rates",
    icon: "◉",
    desc: "Rate by stream & source",
  },
  {
    id: "cost-spend",
    label: "Cost & Spend",
    icon: "◆",
    desc: "Ad spend & cost per hire",
  },
  {
    id: "sources",
    label: "Source Analysis",
    icon: "◐",
    desc: "Hires & rate by channel",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const COLORS = {
  greenDark: "#085041",
  green: "#1D9E75",
  blue: "#185FA5",
  purple: "#534AB7",
  red: "#E24B4A",
  amber: "#BA7517",
  hiresLeads: "#1D9E75",
  hiresLeadBase: "#185FA5",
  hiresReferral: "#BA7517",
  lineLeadsRate: "#085041",
  lineOverallRate: "#534AB7",
};

export const MARKETING_SOURCES = [
  { key: "instagram", label: "Instagram", color: "#E1306C" },
  { key: "facebook", label: "Facebook", color: "#1877F2" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { key: "indeed", label: "Indeed", color: "#2164f3" },
  { key: "referral", label: "Referral", color: "#BA7517" },
] as const;

export const STATIC_MARKETING_DATA = [
  {
    month: "Jan 2026",
    instagram: { leads: 120, hired: 6 },
    facebook: { leads: 90, hired: 3 },
    linkedin: { leads: 40, hired: 4 },
    indeed: { leads: 20, hired: 1 },
    referral: { leads: 10, hired: 1 },
  },
  {
    month: "Feb 2026",
    instagram: { leads: 130, hired: 7 },
    facebook: { leads: 95, hired: 4 },
    linkedin: { leads: 45, hired: 5 },
    indeed: { leads: 22, hired: 1 },
    referral: { leads: 13, hired: 2 },
  },
  {
    month: "Mar 2026",
    instagram: { leads: 145, hired: 8 },
    facebook: { leads: 100, hired: 4 },
    linkedin: { leads: 48, hired: 6 },
    indeed: { leads: 18, hired: 1 },
    referral: { leads: 9, hired: 2 },
  },
  {
    month: "Apr 2026",
    instagram: { leads: 110, hired: 5 },
    facebook: { leads: 88, hired: 3 },
    linkedin: { leads: 50, hired: 5 },
    indeed: { leads: 25, hired: 2 },
    referral: { leads: 12, hired: 2 },
  },
  {
    month: "May 2026",
    instagram: { leads: 135, hired: 7 },
    facebook: { leads: 92, hired: 4 },
    linkedin: { leads: 52, hired: 6 },
    indeed: { leads: 20, hired: 1 },
    referral: { leads: 11, hired: 2 },
  },
  {
    month: "Jun 2026",
    instagram: { leads: 150, hired: 9 },
    facebook: { leads: 105, hired: 5 },
    linkedin: { leads: 55, hired: 7 },
    indeed: { leads: 22, hired: 2 },
    referral: { leads: 14, hired: 2 },
  },
] as const;
