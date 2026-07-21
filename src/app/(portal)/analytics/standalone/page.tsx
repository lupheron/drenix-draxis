import LeadDashboard from "@/components/LeadsDashboard/LeadDashboard";
import { fetchLeadsData } from "@/utils/fetchLeadsData";

export const revalidate = 300;

export default async function AnalyticsStandalonePage() {
  const { data, error } = await fetchLeadsData();

  return <LeadDashboard data={data} error={error} company="JM" />;
}
