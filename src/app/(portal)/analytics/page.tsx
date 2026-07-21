import Link from "next/link";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import DraxisAnalyticsDashboard from "@/components/LeadsDashboard/DraxisAnalyticsDashboard";
import { fetchLeadsData } from "@/utils/fetchLeadsData";

export const revalidate = 300;

export default async function AnalyticsPage() {
  const { data, error } = await fetchLeadsData();

  return (
    <>
      <PageHeaderDefault
        title="Analytics"
        description="JM lead performance — live Google Sheets data inside DRAXIS."
        actions={
          <Link
            href="/analytics/standalone"
            className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Visit analytics-only website
          </Link>
        }
      />
      <DraxisAnalyticsDashboard data={data} error={error} company="JM" />
    </>
  );
}
