"use client";

import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import { hrChartColors } from "@/components/HrCompanyDashboard/SectionNav";
import { useAttendance } from "@/hooks/useAttendance";
import type { CompanyCode } from "@/lib/types";
import type { AttendanceEvent } from "@/types/attendance";
import { cn } from "@/utils/cn";

type Props = {
  company: CompanyCode;
  from: string;
  to: string;
};

function formatWhen(event: AttendanceEvent) {
  if (event.timestamp) return event.timestamp;
  return event.date;
}

function ActionBadge({ event }: { event: AttendanceEvent }) {
  let color = hrChartColors.other;
  if (event.isNoShow) color = hrChartColors.missed;
  else if (event.lateMinutes) color = hrChartColors.voicemail;
  else if (/checked in|entered/i.test(event.action)) color = hrChartColors.hired;
  else if (/checked out|exited/i.test(event.action)) color = hrChartColors.leads;

  return (
    <span
      className="inline-flex rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
      style={{
        borderColor: `${color}66`,
        backgroundColor: `${color}22`,
        color,
      }}
    >
      {event.action}
    </span>
  );
}

export default function AttendanceSection({ company, from, to }: Props) {
  const { data, isLoading, isError, error } = useAttendance(company, from, to);
  const events = data?.data ?? [];
  const summary = data?.summary;

  if (isLoading) {
    return <EyeLoadingDefault size="lg" label="Loading HikVision attendance" />;
  }

  if (isError) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : "Failed to load attendance"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
          HikVision attendance
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Google Sheet tab{" "}
          <span className="text-foreground">{data?.sheetTab ?? company}</span> ·{" "}
          {from} → {to}
        </p>
        {data?.error ? (
          <p className="mt-3 rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {data.error}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardDefault
          id="att-no-shows"
          label="No shows"
          value={String(summary?.noShows ?? 0)}
          trend="down"
        />
        <StatCardDefault
          id="att-lates"
          label="Lates"
          value={String(summary?.lates ?? 0)}
          trend="down"
        />
        <StatCardDefault
          id="att-check-ins"
          label="Check-ins"
          value={String(summary?.checkIns ?? 0)}
          trend="neutral"
        />
        <StatCardDefault
          id="att-check-outs"
          label="Check-outs"
          value={String(summary?.checkOuts ?? 0)}
          trend="neutral"
        />
        <StatCardDefault
          id="att-flagged"
          label="Flagged"
          value={String(summary?.flagged ?? 0)}
          trend="down"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">By person</h2>
        {summary?.byPerson.length ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {["Name", "Events", "No shows", "Lates", "Flagged"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {summary.byPerson.map((person) => (
                  <tr
                    key={person.name}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-foreground">{person.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {person.events}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        person.noShows > 0 ? "text-danger" : "text-muted-foreground",
                      )}
                    >
                      {person.noShows}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        person.lates > 0 ? "text-warning" : "text-muted-foreground",
                      )}
                    >
                      {person.lates}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {person.flagged}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
            No attendance rows in this period.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-light text-foreground">Event log</h2>
        {events.length ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {[
                    "When",
                    "Name",
                    "Action",
                    "Shift",
                    "Notes",
                    "Late",
                    "Flag",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      event.isNoShow && "bg-danger/5",
                      !event.isNoShow &&
                        Boolean(event.lateMinutes) &&
                        "bg-warning/5",
                    )}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatWhen(event)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{event.name}</td>
                    <td className="px-4 py-3">
                      <ActionBadge event={event} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.shift ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.lateMinutes ? `${event.lateMinutes} min` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {event.flagged ? (
                        <span className="text-xs uppercase tracking-[0.15em] text-danger">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-muted">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
            No events for {company} in this date range.
          </p>
        )}
      </section>
    </div>
  );
}
