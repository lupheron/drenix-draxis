"use client";

import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import LeadManagementSection from "@/components/HrCompanyDashboard/LeadManagementSection";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeaderDefault
        title="Lead Management"
        description="JM lead performance — same sheet data, DRAXIS charts."
      />
      <div className="px-8 py-8">
        <LeadManagementSection />
      </div>
    </>
  );
}
