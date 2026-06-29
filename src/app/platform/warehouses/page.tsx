import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";

const WAREHOUSES = [
  {
    id: "wh-chi",
    name: "Chicago Hub",
    capacity: "92%",
    units: 148,
    region: "Midwest",
  },
  {
    id: "wh-la",
    name: "Los Angeles Distribution",
    capacity: "67%",
    units: 96,
    region: "West Coast",
  },
  {
    id: "wh-atl",
    name: "Atlanta Crossdock",
    capacity: "54%",
    units: 72,
    region: "Southeast",
  },
  {
    id: "wh-rot",
    name: "Rotterdam Gateway",
    capacity: "78%",
    units: 210,
    region: "Europe",
  },
];

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
            value="24"
            change="4 regions"
            trend="neutral"
          />
          <StatCardDefault
            id="avg-capacity"
            label="Avg Capacity"
            value="71.2%"
            change="Within threshold"
            trend="neutral"
          />
          <StatCardDefault
            id="throughput"
            label="Daily Throughput"
            value="18.4K"
            change="Units processed"
            trend="up"
          />
          <StatCardDefault
            id="alerts"
            label="Capacity Alerts"
            value="2"
            change="Chicago, Oakland"
            trend="down"
          />
        </div>

        <SectionPanelDefault
          title="Node Overview"
          description="Warehouse status across the Meridian network."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {WAREHOUSES.map((warehouse) => (
              <article
                key={warehouse.id}
                className="border border-border bg-background/40 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground">{warehouse.name}</p>
                    <p className="mt-1 text-xs text-muted">{warehouse.region}</p>
                  </div>
                  <p className="font-mono text-lg text-foreground">
                    {warehouse.capacity}
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {warehouse.units} active storage units
                </p>
              </article>
            ))}
          </div>
        </SectionPanelDefault>
      </div>
    </>
  );
}
