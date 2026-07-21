"use client";

import { use } from "react";
import HrCompanyDashboard from "@/components/HrCompanyDashboard/HrCompanyDashboard";
import { COMPANIES } from "@/constants/companies";
import type { CompanyCode } from "@/lib/types";
import RequireAuth from "@/components/Portal/RequireAuth";

export default function HumanResourcesCompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companyParam } = use(params);
  const company = companyParam.toUpperCase() as CompanyCode;
  const companyMeta = COMPANIES.find((item) => item.code === company);

  if (!companyMeta) {
    return (
      <p className="p-8 text-sm text-danger">Unknown company: {companyParam}</p>
    );
  }

  return (
    <RequireAuth adminOnly guestAllowed={false}>
      <HrCompanyDashboard company={company} />
    </RequireAuth>
  );
}
