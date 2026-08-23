"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import AdminAttendanceView from "@/components/Attendance/AdminAttendanceView";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import { COMPANIES } from "@/constants/companies";
import type { CompanyCode } from "@/lib/types";
import { getDateRangeForPreset } from "@/utils/date-ranges";

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const companyParam = (searchParams.get("company") ?? "JM").toUpperCase();
  const companyMeta = COMPANIES.find((item) => item.code === companyParam);
  const company = (companyMeta?.code ?? "JM") as CompanyCode;

  const range = useMemo(() => getDateRangeForPreset("month"), []);

  return (
    <>
      <PageHeaderDefault
        title="Attendance"
        description="HikVision sync by shift date (Tashkent Face ID → US Central calendar). Review disputes, correct days, approve requests."
      />
      <div className="px-8 py-8">
        <AdminAttendanceView
          defaultCompany={company}
          from={range.from}
          to={range.to}
        />
      </div>
    </>
  );
}

export default function AttendancePage() {
  return (
    <RequireAuth attendanceAccess guestAllowed={false}>
      <Suspense
        fallback={
          <EyeLoadingDefault fullPage size="lg" label="Loading attendance" />
        }
      >
        <AttendancePageContent />
      </Suspense>
    </RequireAuth>
  );
}
