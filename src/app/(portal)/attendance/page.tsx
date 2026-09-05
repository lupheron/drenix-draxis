"use client";

import { Suspense } from "react";
import AttendanceDashboard from "@/components/Attendance/AttendanceDashboard";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";

function AttendancePageContent() {
  return (
    <>
      <PageHeaderDefault
        title="Attendance"
        description="All companies — today, week, month, and custom shift-date ranges at a glance."
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
