import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import DataTableDefault from "@/components/UI/DataTableDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import { MOCK_FLEET } from "@/constants/mock-data";
import { formatRelativeTime } from "@/utils/formatters";

const fleetStatusVariant = {
  active: "success",
  idle: "muted",
  maintenance: "warning",
  offline: "danger",
} as const;

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
          description="Example fleet table for Meridian Freight Group."
        >
          <div className="mb-5 max-w-sm">
            <InputDefault label="Filter units" placeholder="Identifier, location..." />
          </div>
          <DataTableDefault
            data={MOCK_FLEET}
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
