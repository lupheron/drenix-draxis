import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeaderDefault
        title="Analytics"
        description="Pattern detection, forecasting models, and inferred operational signals."
      />

      <div className="space-y-6 px-8 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCardDefault
            id="models"
            label="Active Models"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
          <StatCardDefault
            id="predictions"
            label="Predictions / Day"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
          <StatCardDefault
            id="accuracy"
            label="Model Accuracy"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
        </div>

        <SectionPanelDefault
          title="Emerging Insights"
          description="Insights will appear here once your API is connected."
        >
          <EmptyStateDefault message="No analytics insights loaded." />
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Trend Analysis"
          description="Time-series visualization — connect charting layer later."
        />
      </div>
    </>
  );
}
