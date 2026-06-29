import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import SectionPanelDefault from "@/components/UI/SectionPanelDefault";
import StatusBadgeDefault from "@/components/UI/StatusBadgeDefault";
import { MOCK_ALERTS } from "@/constants/mock-data";
import { formatRelativeTime } from "@/utils/formatters";

const severityVariant = {
  critical: "danger",
  warning: "warning",
  info: "muted",
} as const;

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
          <ul className="divide-y divide-border border border-border">
            {MOCK_ALERTS.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-col gap-3 bg-background/20 px-5 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-foreground">{alert.title}</p>
                    <StatusBadgeDefault
                      status={alert.severity}
                      variant={severityVariant[alert.severity]}
                    />
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-muted">
                    {alert.source} · {formatRelativeTime(alert.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionPanelDefault>

        <SectionPanelDefault
          title="Alert Rules"
          description="Configure thresholds and routing — auth-gated in production."
        />
      </div>
    </>
  );
}
