import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import DataTableDefault from "@/components/UI/DataTableDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import type { Shipment } from "@/types/logistics";

const shipmentStatusVariant = {
  in_transit: "default",
  delivered: "success",
  delayed: "warning",
  pending: "muted",
  exception: "danger",
} as const;

const shipmentData: Shipment[] = [];

export default function ShipmentsPage() {
  return (
    <>
      <PageHeaderDefault
        title="Shipments"
        description="Inbound and outbound cargo flow across the Meridian network."
      />

      <div className="space-y-6 px-8 py-8">
        <SectionPanelDefault
          title="Shipment Ledger"
          description="Shipments will appear here once your API is connected."
        >
          <DataTableDefault
            data={shipmentData}
            emptyMessage="No shipments loaded. Connect your API to populate this table."
            columns={[
              {
                key: "reference",
                header: "Reference",
                render: (row) => (
                  <span className="font-mono text-foreground">{row.reference}</span>
                ),
              },
              {
                key: "origin",
                header: "Origin",
                render: (row) => row.origin,
              },
              {
                key: "destination",
                header: "Destination",
                render: (row) => row.destination,
              },
              {
                key: "carrier",
                header: "Carrier",
                render: (row) => row.carrier,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusBadgeDefault
                    status={row.status}
                    variant={shipmentStatusVariant[row.status]}
                  />
                ),
              },
            ]}
          />
        </SectionPanelDefault>
      </div>
    </>
  );
}
