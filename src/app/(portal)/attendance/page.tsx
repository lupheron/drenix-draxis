"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AttendanceDashboard from "@/components/Attendance/AttendanceDashboard";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";

function AttendancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get("company");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  useEffect(() => {
    if (!company) return;
    const params = new URLSearchParams();
    params.set("company", company.toUpperCase());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.replace(`/attendance/manage?${params.toString()}`);
  }, [company, from, to, router]);

  if (company) {
    return (
      <EyeLoadingDefault fullPage size="lg" label="Opening company attendance" />
    );
  }

  return (
    <>
      <PageHeaderDefault
        title="Attendance"
        description="All companies — today, week, month, and custom shift-date ranges. Use Manage on a company card to search employees by name."
      />
      <div className="px-8 py-8">
        <AttendanceDashboard />
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
