"use client";

import ModalDefault from "@/components/UI/ModalDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { useDailyMetrics } from "@/hooks/useEmployees";
import type { MetricField } from "@/lib/types";
import { formatDate } from "@/utils/formatters";

const METRIC_LABELS: Record<MetricField, string> = {
  minutes_on_call: "Minutes on call",
  calls_made: "Calls made",
  outbound_calls: "Outbound calls",
  inbound_calls: "Inbound calls",
  missed_calls: "Missed calls",
  voicemail_calls: "Voicemail",
  other_calls: "Other calls",
  outbound_minutes: "Outbound minutes",
  inbound_minutes: "Inbound minutes",
  lates: "Lates",
  leads: "Leads",
  follow_up: "Follow-up",
  hires: "Hired",
  loaded: "Loaded",
  rejected: "Rejected",
};

const METRIC_HINTS: Partial<Record<MetricField, string>> = {
  leads: "Monday New leads boards",
  follow_up: "Monday Follow up boards",
  hires: "Just hired — Monday HR Process JDM · Hired group",
  loaded: "First load / real hire — Monday HR Process JDM · Loaded group",
  rejected: "Rejected from Monday boards / HR Process",
  lates: "Lates sync coming soon (Google Sheets)",
  calls_made: "RingCentral total calls",
  minutes_on_call: "RingCentral talk minutes",
};

const ALL_DAILY_FIELDS: MetricField[] = [
  "calls_made",
  "minutes_on_call",
  "outbound_calls",
  "inbound_calls",
  "missed_calls",
  "voicemail_calls",
  "other_calls",
  "outbound_minutes",
  "inbound_minutes",
  "lates",
  "leads",
  "follow_up",
  "hires",
  "loaded",
  "rejected",
];

type MetricsDetailModalProps = {
  open: boolean;
  employeeName: string;
  userId: number | string | null;
  metric: MetricField | null;
  from: string;
  to: string;
  onClose: () => void;
};

export default function MetricsDetailModal({
  open,
  employeeName,
  userId,
  metric,
  from,
  to,
  onClose,
}: MetricsDetailModalProps) {
  const { data, isLoading, isError } = useDailyMetrics(userId, from, to, open);

  const rows = data ?? [];
  const hasData = rows.some((row) =>
    metric
      ? (row[metric] ?? 0) > 0
      : ALL_DAILY_FIELDS.some((field) => (row[field] ?? 0) > 0),
  );

  const fields: MetricField[] = metric ? [metric] : ALL_DAILY_FIELDS;

  return (
    <ModalDefault
      open={open}
      title={metric ? METRIC_LABELS[metric] : "Daily metrics"}
      description={
        open
          ? `${employeeName} · ${formatDate(from)} — ${formatDate(to)}${
              metric && METRIC_HINTS[metric] ? ` · ${METRIC_HINTS[metric]}` : ""
            }`
          : undefined
      }
      onClose={onClose}
      className="max-w-5xl"
    >
      {isLoading ? (
        <EyeLoadingDefault size="sm" label="Loading daily breakdown" />
      ) : isError ? (
        <p className="text-sm text-danger">Could not load daily metrics.</p>
      ) : !hasData ? (
        <p className="rounded-sm border border-border bg-surface-elevated px-4 py-8 text-center text-sm text-muted-foreground">
          Metrics not synced yet for this period.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                  Date
                </th>
                {fields.map((field) => (
                  <th
                    key={field}
                    title={METRIC_HINTS[field]}
                    className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted"
                  >
                    {METRIC_LABELS[field]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-foreground">
                    {formatDate(row.date)}
                  </td>
                  {fields.map((field) => (
                    <td key={field} className="px-3 py-2 font-mono text-muted-foreground">
                      {row[field] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModalDefault>
  );
}
