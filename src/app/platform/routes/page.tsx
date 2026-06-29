import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";

const ROUTES = [
  {
    id: "rt-001",
    name: "Chicago → Atlanta Corridor",
    distance: "716 mi",
    avgTransit: "11h 20m",
    risk: "Low",
  },
  {
    id: "rt-002",
    name: "Rotterdam → Chicago Intermodal",
    distance: "4,280 mi",
    avgTransit: "18d 6h",
    risk: "Moderate",
  },
  {
    id: "rt-003",
    name: "Oakland Port → Inland Distribution",
    distance: "420 mi",
    avgTransit: "7h 45m",
    risk: "Elevated",
  },
];

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
          description="Primary routes under continuous monitoring."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {ROUTES.map((route) => (
              <article
                key={route.id}
                className="border border-border bg-background/40 p-5"
              >
                <p className="text-sm text-foreground">{route.name}</p>
                <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt>Distance</dt>
                    <dd className="font-mono text-foreground">{route.distance}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Avg transit</dt>
                    <dd className="font-mono text-foreground">{route.avgTransit}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Risk level</dt>
                    <dd className="text-foreground">{route.risk}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Route Map"
          description="Geospatial visualization module — connect mapping provider later."
        />
      </div>
    </>
  );
}
