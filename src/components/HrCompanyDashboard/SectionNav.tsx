"use client";

import { cn } from "@/utils/cn";

export type HrCompanySection =
  | "analytics"
  | "lead-management"
  | "driver-database"
  | "attendance"
  | "ringcentral"
  | "monday"
  | "people";

const SECTIONS: {
  id: HrCompanySection;
  label: string;
  hint: string;
  /** When set, section only appears for this company */
  companyOnly?: "JM";
}[] = [
  {
    id: "analytics",
    label: "Analytics",
    hint: "Company overview",
  },
  {
    id: "lead-management",
    label: "Lead Management",
    hint: "Sheets · hire funnel",
    companyOnly: "JM",
  },
  {
    id: "driver-database",
    label: "Driver Database",
    hint: "Search · Monday history",
    companyOnly: "JM",
  },
  {
    id: "attendance",
    label: "Attendance",
    hint: "HikVision · sheet",
  },
  {
    id: "ringcentral",
    label: "RingCentral",
    hint: "Calls & talk time",
  },
  {
    id: "monday",
    label: "Monday.com",
    hint: "Leads & pipeline",
  },
  {
    id: "people",
    label: "People",
    hint: "Per person",
  },
];

type SectionNavProps = {
  active: HrCompanySection;
  onChange: (section: HrCompanySection) => void;
  company?: string;
};

export default function HrCompanySectionNav({
  active,
  onChange,
  company,
}: SectionNavProps) {
  const visibleSections = SECTIONS.filter(
    (section) => !section.companyOnly || section.companyOnly === company,
  );

  return (
    <nav className="flex flex-wrap gap-1 border border-border bg-surface p-1">
      {visibleSections.map((section) => {
        const isActive = section.id === active;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn(
              "min-w-[8.5rem] flex-1 px-3 py-2.5 text-left transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent-dim hover:text-foreground",
            )}
          >
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em]">
              {section.label}
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[10px]",
                isActive ? "text-background/70" : "text-muted",
              )}
            >
              {section.hint}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function formatTalkTime(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function employeeLabel(employee: {
  first_name: string;
  last_name: string;
}): string {
  return `${employee.first_name} ${employee.last_name}`.trim();
}

export function shortName(employee: {
  first_name: string;
  last_name: string;
}): string {
  const last = employee.last_name?.trim() ?? "";
  return `${employee.first_name}${last ? ` ${last.charAt(0)}.` : ""}`;
}

export const hrChartColors = {
  outbound: "#2dd4bf",
  inbound: "#a78bfa",
  missed: "#f43f5e",
  voicemail: "#fbbf24",
  other: "#94a3b8",
  calls: "#fb7185",
  minutes: "#c084fc",
  leads: "#60a5fa",
  followUp: "#f59e0b",
  hired: "#34d399",
  loaded: "#38bdf8",
  rejected: "#f472b6",
  texts: "#38bdf8",
  textsSent: "#2dd4bf",
  textsReceived: "#a78bfa",
  grid: "rgba(255,255,255,0.06)",
  muted: "#737373",
  foreground: "#f0f0f0",
};
