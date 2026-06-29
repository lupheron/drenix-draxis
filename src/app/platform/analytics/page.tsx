import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";

const INSIGHTS = [
  {
    id: "in-001",
    title: "Demand surge — Southeast corridor",
    confidence: "87%",
    horizon: "72 hours",
  },
  {
    id: "in-002",
    title: "Port congestion risk — Oakland",
    confidence: "74%",
    horizon: "5 days",
  },
  {
    id: "in-003",
    title: "Fuel cost variance — Midwest routes",
    confidence: "91%",
    horizon: "14 days",
  },
];

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
            value="12"
            change="3 retraining"
            trend="neutral"
          />
          <StatCardDefault
            id="predictions"
            label="Predictions / Day"
            value="2.1M"
            change="+4.2%"
            trend="up"
          />
          <StatCardDefault
            id="accuracy"
            label="Model Accuracy"
            value="94.6%"
            change="Rolling 30d"
            trend="up"
          />
        </div>

        <SectionPanelDefault
          title="Emerging Insights"
          description="High-confidence signals from the intelligence layer."
        >
          <ul className="space-y-3">
            {INSIGHTS.map((insight) => (
              <li
                key={insight.id}
                className="flex items-center justify-between border border-border bg-background/40 px-4 py-4"
              >
                <p className="text-sm text-foreground">{insight.title}</p>
                <div className="text-right text-xs text-muted-foreground">
                  <p className="font-mono text-foreground">{insight.confidence}</p>
                  <p className="mt-1">{insight.horizon}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Trend Analysis"
          description="Time-series visualization — connect charting layer later."
        />
      </div>
    </>
  );
}
