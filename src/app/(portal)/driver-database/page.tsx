"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DriverDatabaseSection from "@/components/HrCompanyDashboard/DriverDatabaseSection";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import { COMPANIES } from "@/constants/companies";
import type { CompanyCode } from "@/lib/types";

function DriverDatabaseContent() {
  const searchParams = useSearchParams();
  const companyParam = (searchParams.get("company") ?? "JM").toUpperCase();
  const companyMeta = COMPANIES.find((item) => item.code === companyParam);
  const company = (companyMeta?.code ?? "JM") as CompanyCode;

  return (
    <>
      <PageHeaderDefault
        title="Driver / Lead Database"
        description="Search applicants and browse Monday-synced lead history from the database. JM-first; synced data only — no live Monday calls from the browser."
      />
      <div className="px-8 py-8">
        <DriverDatabaseSection company={company} />
      </div>
    </>
  );
}

export default function DriverDatabasePage() {
  return (
    <RequireAuth guestAllowed>
      <Suspense
        fallback={
          <EyeLoadingDefault fullPage size="lg" label="Loading driver database" />
        }
      >
        <DriverDatabaseContent />
      </Suspense>
    </RequireAuth>
  );
}
