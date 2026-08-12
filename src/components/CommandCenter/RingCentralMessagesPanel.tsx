"use client";

import { useEffect, useMemo, useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import {
  useRingCentralConversations,
  useRingCentralMessages,
} from "@/hooks/useEmployees";
import type { MessageDirection } from "@/lib/types";
import { cn } from "@/utils/cn";

type Props = {
  userId: number | string | null;
  from: string;
  to: string;
  enabled: boolean;
};

const DIRECTIONS: { id: MessageDirection | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "outbound", label: "Sent" },
  { id: "inbound", label: "Received" },
];

export default function RingCentralMessagesPanel({
  userId,
  from,
  to,
  enabled,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [direction, setDirection] = useState<MessageDirection | "">("");
  const [page, setPage] = useState(1);

  const conversations = useRingCentralConversations(userId, from, to, enabled);
  const rows = conversations.data?.data ?? [];
  const summary = conversations.data?.summary;

  useEffect(() => {
    if (!selectedId && rows.length > 0) {
      setSelectedId(rows[0].id);
      setPage(1);
    }
  }, [rows, selectedId]);

  useEffect(() => {
    setSelectedId(null);
    setPage(1);
  }, [from, to, userId]);

  const messages = useRingCentralMessages(
    userId,
    {
      from,
      to,
      conversation_id: selectedId ?? undefined,
      direction,
      page,
      per_page: 80,
    },
    enabled && Boolean(selectedId),
  );

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const messageRows = messages.data?.data ?? [];
  const meta = messages.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.per_page))
    : 1;

  // Oldest → newest in the thread (API may return newest first)
  const thread = useMemo(() => {
    return [...messageRows].sort(
      (a, b) =>
        new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
    );
  }, [messageRows]);

  if (conversations.isLoading) {
    return <EyeLoadingDefault size="md" label="Loading texts" />;
  }

  if (conversations.isError) {
    return (
      <p className="text-sm text-danger">
        Could not load texts. Backend SMS sync may not be ready yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Messages" value={summary?.total_messages ?? 0} />
        <Stat label="Sent" value={summary?.outbound ?? 0} />
        <Stat label="Received" value={summary?.inbound ?? 0} />
        <Stat
          label="Conversations"
          value={summary?.conversations_count ?? rows.length}
        />
      </div>

      <div className="flex min-h-[420px] overflow-hidden border border-border">
        <aside className="flex w-full max-w-[280px] flex-col border-r border-border bg-surface-elevated">
          <div className="border-b border-border px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Conversations
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {from} → {to}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No SMS conversations in this date range.
              </p>
            ) : (
              rows.map((row) => {
                const active = row.id === selectedId;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(row.id);
                      setPage(1);
                    }}
                    className={cn(
                      "w-full border-b border-border px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-accent-dim text-foreground"
                        : "hover:bg-accent-dim/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm text-foreground">
                        {row.peer_name || row.peer_number || "Unknown"}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-muted">
                        {row.message_count}
                      </span>
                    </div>
                    {row.peer_name ? (
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted">
                        {row.peer_number}
                      </p>
                    ) : null}
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {row.last_preview || "—"}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      {formatStamp(row.last_message_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {selected
                  ? selected.peer_name || selected.peer_number
                  : "Select a conversation"}
              </p>
              {selected?.peer_name ? (
                <p className="font-mono text-[10px] text-muted">
                  {selected.peer_number}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1">
              {DIRECTIONS.map((option) => (
                <button
                  key={option.id || "all"}
                  type="button"
                  onClick={() => {
                    setDirection(option.id);
                    setPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors",
                    direction === option.id
                      ? "bg-foreground text-background"
                      : "bg-accent-dim text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {!selectedId ? (
              <p className="text-sm text-muted-foreground">
                Pick a conversation on the left.
              </p>
            ) : messages.isLoading ? (
              <EyeLoadingDefault size="sm" label="Loading messages" />
            ) : messages.isError ? (
              <p className="text-sm text-danger">Could not load messages.</p>
            ) : thread.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages for this filter.
              </p>
            ) : (
              thread.map((message) => {
                const outbound = message.direction === "outbound";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      outbound ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] border px-3 py-2",
                        outbound
                          ? "border-border-strong bg-accent-dim text-foreground"
                          : "border-border bg-surface-elevated text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.body || "(empty)"}
                      </p>
                      <p
                        className={cn(
                          "mt-1.5 text-[10px]",
                          outbound ? "text-right text-muted" : "text-muted",
                        )}
                      >
                        {formatStamp(message.sent_at)}
                        {message.status ? ` · ${message.status}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedId && meta && meta.total > meta.per_page ? (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2">
              <p className="text-xs text-muted-foreground">
                {meta.total} messages · page {meta.page} of {totalPages}
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
          ) : null}
        </section>
      </div>
    </div>
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

function formatStamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
