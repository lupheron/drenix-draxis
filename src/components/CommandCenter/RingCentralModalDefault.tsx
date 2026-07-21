"use client";

import { useState } from "react";
import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import {
  useRingCentralCalls,
  useRingCentralOverview,
} from "@/hooks/useEmployees";
import type { CallType } from "@/lib/types";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const CALL_TYPES: { id: CallType | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "outbound", label: "Outbound" },
  { id: "inbound", label: "Inbound" },
  { id: "missed", label: "Missed" },
  { id: "voicemail", label: "Voicemail" },
  { id: "other", label: "Other" },
];

type RingCentralModalProps = {
  open: boolean;
  employeeName: string;
  userId: number | string | null;
  from: string;
  to: string;
  onClose: () => void;
};

export default function RingCentralModalDefault({
  open,
  employeeName,
  userId,
  from,
  to,
  onClose,
}: RingCentralModalProps) {
  const [callType, setCallType] = useState<CallType | "">("");
  const [page, setPage] = useState(1);

  const overview = useRingCentralOverview(userId, from, to, open);
  const calls = useRingCentralCalls(
    userId,
    { from, to, type: callType, page, per_page: 50 },
    open,
  );

  const summary = overview.data?.summary;
  const daily = overview.data?.daily ?? [];
  const callRows = calls.data?.data ?? [];
  const meta = calls.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.per_page))
    : 1;

  function changeType(next: CallType | "") {
    setCallType(next);
    setPage(1);
  }

  return (
    <ModalDefault
      open={open}
      title={`RingCentral — ${employeeName || "Employee"}`}
      description={`${formatDate(from)} — ${formatDate(to)} · synced from API (not live RC)`}
      onClose={onClose}
      resizable
      defaultWidth={980}
      defaultHeight={740}
      className="max-w-none"
    >
      {overview.isLoading ? (
        <EyeLoadingDefault size="md" label="Loading RingCentral" />
      ) : overview.isError ? (
        <p className="text-sm text-danger">Could not load RingCentral summary.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Total calls" value={summary?.total_calls ?? 0} />
            <Stat label="Outbound" value={summary?.outbound ?? 0} />
            <Stat label="Inbound" value={summary?.inbound ?? 0} />
            <Stat label="Missed" value={summary?.missed ?? 0} />
            <Stat label="Voicemail" value={summary?.voicemail ?? 0} />
            <Stat label="Other" value={summary?.other ?? 0} />
            <Stat label="Minutes total" value={summary?.minutes_total ?? 0} />
            <Stat label="Minutes outbound" value={summary?.minutes_outbound ?? 0} />
            <Stat label="Minutes inbound" value={summary?.minutes_inbound ?? 0} />
          </div>

          <section>
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              Daily breakdown
            </h3>
            {daily.length === 0 ? (
              <p className="text-sm text-muted-foreground">No daily rows for this period.</p>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated">
                      {[
                        "Date",
                        "Total",
                        "Out",
                        "In",
                        "Missed",
                        "VM",
                        "Other",
                        "Min",
                        "Min out",
                        "Min in",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((row) => (
                      <tr
                        key={row.date ?? `${row.total_calls}-${row.minutes_total}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-3 py-2 text-foreground">
                          {row.date ? formatDate(row.date) : "—"}
                        </td>
                        <Mono>{row.total_calls}</Mono>
                        <Mono>{row.outbound}</Mono>
                        <Mono>{row.inbound}</Mono>
                        <Mono>{row.missed}</Mono>
                        <Mono>{row.voicemail}</Mono>
                        <Mono>{row.other}</Mono>
                        <Mono>{row.minutes_total}</Mono>
                        <Mono>{row.minutes_outbound}</Mono>
                        <Mono>{row.minutes_inbound}</Mono>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted">
                Call list
              </h3>
              <div className="flex flex-wrap gap-1">
                {CALL_TYPES.map((option) => (
                  <button
                    key={option.id || "all"}
                    type="button"
                    onClick={() => changeType(option.id)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors",
                      callType === option.id
                        ? "bg-foreground text-background"
                        : "bg-accent-dim text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {calls.isLoading ? (
              <EyeLoadingDefault size="sm" label="Loading calls" />
            ) : calls.isError ? (
              <p className="text-sm text-danger">Could not load call list.</p>
            ) : callRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calls for this filter.</p>
            ) : (
              <>
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-elevated">
                        {["Started", "Type", "Direction", "Result", "Minutes", "Seconds"].map(
                          (header) => (
                            <th
                              key={header}
                              className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {callRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-3 py-2 text-foreground">
                            {formatStartedAt(row.started_at)}
                          </td>
                          <td className="px-3 py-2 capitalize text-muted-foreground">
                            {row.call_type}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {row.direction ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {row.result ?? "—"}
                          </td>
                          <Mono>{row.duration_minutes.toFixed(2)}</Mono>
                          <Mono>{row.duration_seconds}</Mono>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {meta
                      ? `${meta.total} calls · page ${meta.page} of ${totalPages}`
                      : null}
                  </p>
                  <div className="flex gap-2">
                    <ButtonDefault
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </ButtonDefault>
                    <ButtonDefault
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                    >
                      Next
                    </ButtonDefault>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </ModalDefault>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-surface-elevated px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg text-foreground">{value}</p>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 font-mono text-muted-foreground">{children}</td>;
}

function formatStartedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
