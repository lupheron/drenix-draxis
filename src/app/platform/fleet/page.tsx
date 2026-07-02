import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import DataTableDefault from "@/components/UI/DataTableDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import type { FleetUnit } from "@/types/logistics";
import { formatRelativeTime } from "@/utils/formatters";

const fleetStatusVariant = {
  active: "success",
  idle: "muted",
  maintenance: "warning",
  offline: "danger",
} as const;

const fleetData: FleetUnit[] = [];

export default function FleetPage() {
  return (
    <>
      <PageHeaderDefault
        title="Fleet"
        description="Live unit registry, telemetry status, and last-known positions."
      />

      <div className="space-y-6 px-8 py-8">
        <SectionPanelDefault
          title="Unit Registry"
          description="Fleet units will appear here once your API is connected."
        >
          <div className="mb-5 max-w-sm">
            <InputDefault label="Filter units" placeholder="Identifier, location..." />
          </div>
          <DataTableDefault
            data={fleetData}
            emptyMessage="No fleet units loaded. Connect your API to populate this table."
            columns={[
              {
                key: "identifier",
                header: "Identifier",
                render: (row) => (
                  <span className="font-mono text-foreground">{row.identifier}</span>
                ),
              },
              {
                key: "type",
                header: "Type",
                render: (row) => row.type,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusBadgeDefault
                    status={row.status}
                    variant={fleetStatusVariant[row.status]}
                  />
                ),
              },
              {
                key: "location",
                header: "Location",
                render: (row) => row.location,
              },
              {
                key: "signal",
                header: "Last Signal",
                render: (row) => formatRelativeTime(row.lastSignal),
              },
            ]}
          />
        </SectionPanelDefault>
      </div>
    </>
  );
}
