import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";

export default function NetworkPage() {
  return (
    <>
      <PageHeaderDefault
        title="Network"
        description="Connection topology, latency metrics, and inter-node communication health."
      />

      <div className="space-y-6 px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionPanelDefault
            title="Topology"
            description="Graph view of nodes, edges, and relay points."
          />
          <SectionPanelDefault
            title="Latency Matrix"
            description="Round-trip times between primary infrastructure nodes."
          />
        </div>

        <SectionPanelDefault
          title="Signal Health"
          description="Telemetry ingestion rates and connection stability."
        />
      </div>
    </>
  );
}
