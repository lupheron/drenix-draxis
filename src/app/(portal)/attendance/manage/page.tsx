"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminAttendanceView from "@/components/Attendance/AdminAttendanceView";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import DatePickerDefault from "@/components/FormItems/DatePicker/DatePickerDefault";
import { COMPANIES } from "@/constants/companies";
import type { CompanyCode } from "@/lib/types";
import { getDateRangeForPreset } from "@/utils/date-ranges";
import Link from "next/link";

function ManageAttendanceContent() {
  const searchParams = useSearchParams();
  const companyParam = (searchParams.get("company") ?? "JM").toUpperCase();
  const companyMeta = COMPANIES.find((item) => item.code === companyParam);
  const company = (companyMeta?.code ?? "JM") as CompanyCode;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const defaultRange = useMemo(() => {
    if (fromParam && toParam) return { from: fromParam, to: toParam };
    return getDateRangeForPreset("month");
  }, [fromParam, toParam]);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  useEffect(() => {
    setFrom(defaultRange.from);
    setTo(defaultRange.to);
  }, [defaultRange.from, defaultRange.to]);

  return (
    <>
      <PageHeaderDefault
        title="Manage attendance"
        description="Search employees, correct shift days, and review punch details for one company."
      />
      <div className="space-y-6 px-8 py-8">
        <Link
          href="/attendance"
          className="inline-block text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
        >
          ← Back to dashboard
        </Link>

        <div className="flex flex-wrap items-end gap-5 border border-border bg-surface p-5">
          <DatePickerDefault
            label="From"
            value={from}
            onChange={setFrom}
            wrapperClassName="min-w-[16rem]"
          />
          <DatePickerDefault
            label="To"
            value={to}
            onChange={setTo}
            min={from}
            wrapperClassName="min-w-[16rem]"
          />
        </div>

        <AdminAttendanceView
          defaultCompany={company}
          from={from}
          to={to}
        />
      </div>
    </>
  );
}

export default function ManageAttendancePage() {
  return (
    <RequireAuth attendanceAccess guestAllowed={false}>
      <Suspense
        fallback={
          <EyeLoadingDefault fullPage size="lg" label="Loading attendance" />
        }
      >
        <ManageAttendanceContent />
      </Suspense>
    </RequireAuth>
  );
}
