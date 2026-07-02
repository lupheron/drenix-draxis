import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";

export default function WarehousesPage() {
  return (
    <>
      <PageHeaderDefault
        title="Warehouses"
        description="Storage nodes, capacity utilization, and regional distribution points."
      />

      <div className="space-y-6 px-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardDefault
            id="total-nodes"
            label="Active Nodes"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
          <StatCardDefault
            id="avg-capacity"
            label="Avg Capacity"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
          <StatCardDefault
            id="throughput"
            label="Daily Throughput"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
          <StatCardDefault
            id="alerts"
            label="Capacity Alerts"
            value="—"
            change="Awaiting API data"
            trend="neutral"
          />
        </div>

        <SectionPanelDefault
          title="Node Overview"
          description="Warehouse nodes will appear here once your API is connected."
        >
          <EmptyStateDefault message="No warehouse nodes loaded." />
        </SectionPanelDefault>
      </div>
    </>
  );
}
