"use client";

import { useMemo, useState } from "react";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import PeriodSwitcherDefault from "@/components/UI/PeriodSwitcherDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RingCentralModalDefault from "@/components/CommandCenter/RingCentralModalDefault";
import HrCompanySectionNav, {
  type HrCompanySection,
} from "@/components/HrCompanyDashboard/SectionNav";
import AnalyticsSection from "@/components/HrCompanyDashboard/AnalyticsSection";
import RingCentralSection from "@/components/HrCompanyDashboard/RingCentralSection";
import MondaySection from "@/components/HrCompanyDashboard/MondaySection";
import PeopleSection from "@/components/HrCompanyDashboard/PeopleSection";
import { getCompanyLabel } from "@/constants/companies";
import { useCompanyHrAnalytics } from "@/hooks/useEmployees";
import type { CompanyCode, Employee } from "@/lib/types";
import type { PerformancePeriod } from "@/types/staff";
import { getDateRangeForPreset } from "@/utils/date-ranges";

type Props = {
  company: CompanyCode;
};

export default function HrCompanyDashboard({ company }: Props) {
  const [section, setSection] = useState<HrCompanySection>("analytics");
  const [period, setPeriod] = useState<PerformancePeriod>("month");
  const [customFrom, setCustomFrom] = useState(() =>
    getDateRangeForPreset("month").from,
  );
  const [customTo, setCustomTo] = useState(() =>
    getDateRangeForPreset("month").to,
  );
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [ringCentralEmployee, setRingCentralEmployee] =
    useState<Employee | null>(null);

  const periodRange =
    period === "custom"
      ? { from: customFrom, to: customTo }
      : getDateRangeForPreset(period);

  const { data, isLoading, isError, error } = useCompanyHrAnalytics(
    company,
    periodRange.from,
    periodRange.to,
  );

  const employees = useMemo(() => data?.by_employee ?? [], [data?.by_employee]);

  function selectPerson(employee: Employee) {
    setSelectedPersonId(employee.id);
    setSection("people");
  }

  function changeSection(next: HrCompanySection) {
    setSection(next);
    if (next !== "people") {
      // keep selection so returning to People restores view
    }
  }

  return (
    <>
      <PageHeaderDefault
        title={`Human Resources — ${company}`}
        description={`${getCompanyLabel(company)} · company dashboard, RingCentral, Monday.com, and people`}
      />

      <div className="space-y-6 px-8 py-8">
        <div className="flex flex-col gap-4 border border-border bg-surface p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
              Performance window
            </p>
            <PeriodSwitcherDefault
              activePeriod={period}
              onChange={setPeriod}
              className="mt-3"
            />
          </div>
          <p className="text-xs text-muted-foreground lg:max-w-sm lg:text-right">
            Company charts first. Open People (or click a name in Analytics) for
            one person.
          </p>
        </div>

        {period === "custom" ? (
          <div className="grid gap-4 border border-border bg-surface p-5 sm:grid-cols-2">
            <InputDefault
              label="From"
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
            <InputDefault
              label="To"
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </div>
        ) : null}

        <HrCompanySectionNav active={section} onChange={changeSection} />

        {isLoading ? (
          <EyeLoadingDefault
            fullPage
            size="lg"
            label={`Loading ${company} dashboard`}
          />
        ) : isError ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : "Failed to load analytics"}
          </p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">No analytics data.</p>
        ) : (
          <>
            {section === "analytics" ? (
              <AnalyticsSection
                data={data}
                employees={employees}
                onSelectPerson={selectPerson}
              />
            ) : null}
            {section === "ringcentral" ? (
              <RingCentralSection data={data} employees={employees} />
            ) : null}
            {section === "monday" ? (
              <MondaySection data={data} employees={employees} />
            ) : null}
            {section === "people" ? (
              <PeopleSection
                employees={employees}
                selectedId={selectedPersonId}
                onSelect={(employee) => setSelectedPersonId(employee.id)}
                from={periodRange.from}
                to={periodRange.to}
                onOpenRingCentral={setRingCentralEmployee}
              />
            ) : null}
          </>
        )}
      </div>

      <RingCentralModalDefault
        open={Boolean(ringCentralEmployee)}
        employeeName={
          ringCentralEmployee
            ? `${ringCentralEmployee.first_name} ${ringCentralEmployee.last_name}`
            : ""
        }
        userId={ringCentralEmployee?.id ?? null}
        from={periodRange.from}
        to={periodRange.to}
        onClose={() => setRingCentralEmployee(null)}
      />
    </>
  );
}
