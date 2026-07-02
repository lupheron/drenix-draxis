import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";

export default function AlertsPage() {
  return (
    <>
      <PageHeaderDefault
        title="Alerts"
        description="Exceptions, risk signals, and system-generated operational warnings."
      />

      <div className="space-y-6 px-8 py-8">
        <SectionPanelDefault
          title="Active Exceptions"
          description="Unresolved alerts requiring review or acknowledgment."
        >
          <EmptyStateDefault message="No alerts loaded. Connect your API to receive live signals." />
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Alert Rules"
          description="Configure thresholds and routing — auth-gated in production."
        />
      </div>
    </>
  );
}
