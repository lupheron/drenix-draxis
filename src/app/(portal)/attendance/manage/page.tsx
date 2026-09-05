"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AdminAttendanceView from "@/components/Attendance/AdminAttendanceView";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
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
  const range = useMemo(() => {
    if (fromParam && toParam) return { from: fromParam, to: toParam };
    return getDateRangeForPreset("month");
  }, [fromParam, toParam]);

  return (
    <>
      <PageHeaderDefault
        title="Manage attendance"
        description="Correct shift days and review punch details for one company."
      />
      <div className="px-8 py-8">
        <Link
          href="/attendance"
          className="mb-6 inline-block text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
        <AdminAttendanceView
          defaultCompany={company}
          from={range.from}
          to={range.to}
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
