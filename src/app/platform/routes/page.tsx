import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";

export default function RoutesPage() {
  return (
    <>
      <PageHeaderDefault
        title="Routes"
        description="Path intelligence, corridor analysis, and optimization signals."
      />

      <div className="space-y-6 px-8 py-8">
        <SectionPanelDefault
          title="Active Corridors"
          description="Routes will appear here once your API is connected."
        >
          <EmptyStateDefault message="No routes loaded. Connect your API to populate corridors." />
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Route Map"
          description="Geospatial visualization module — connect mapping provider later."
        />
      </div>
    </>
  );
}
