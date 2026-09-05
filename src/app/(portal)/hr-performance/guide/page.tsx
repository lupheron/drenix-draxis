"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import HrPerformanceGuideContent from "@/components/Performance/HrPerformanceGuideContent";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";

function GuideContent() {
  const searchParams = useSearchParams();
  const audience =
    searchParams.get("audience") === "employee" ? "employee" : "admin";

  return (
    <div className="px-8 py-8">
      <HrPerformanceGuideContent audience={audience} />
    </div>
  );
}

export default function HrPerformanceGuidePage() {
  return (
    <RequireAuth guestAllowed>
      <Suspense
        fallback={
          <EyeLoadingDefault fullPage size="lg" label="Loading guide" />
        }
      >
        <GuideContent />
      </Suspense>
    </RequireAuth>
  );
}
