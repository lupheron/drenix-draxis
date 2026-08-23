"use client";

import type { AttendanceDay, AttendanceDayStatus } from "@/lib/types";
import AttendanceStatusPill from "@/components/Attendance/AttendanceStatusPill";
import {
  formatAttendanceClock,
  formatAttendanceTimeOnly,
  parseDayEvents,
  type AttendanceTimezone,
} from "@/utils/attendance-display";
import { cn } from "@/utils/cn";

type Props = {
  day: AttendanceDay;
  timezone: AttendanceTimezone;
};

function EventRow({
  label,
  time,
  note,
  muted,
}: {
  label: string;
  time: string;
  note?: string | null;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-b-0",
        muted && "opacity-80",
      )}
    >
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <div className="text-right">
        <p className="text-sm text-foreground">{time}</p>
        {note ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function AttendanceDayDetail({ day, timezone }: Props) {
  const parsed = parseDayEvents(day.events);
  const tzLabel = timezone === "Asia/Tashkent" ? "Tashkent" : "US Central";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Shift date
          </p>
          <p className="mt-1 text-sm text-foreground">{day.date}</p>
        </div>
        <AttendanceStatusPill day={day} />
      </div>

      <p className="text-xs text-muted-foreground">
        Overnight shifts (e.g. 18:00 → 03:00 Tashkent) stay on this shift date.
        Punch times below are shown in {tzLabel}.
      </p>

      <div className="border border-border bg-surface-elevated/40 px-4 py-2">
        <EventRow
          label="Check-in"
          time={formatAttendanceClock(parsed.checkIn?.occurred_at, timezone)}
          note={parsed.checkIn?.sheet_note}
        />
        <EventRow
          label="Check-out"
          time={formatAttendanceClock(parsed.checkOut?.occurred_at, timezone)}
          note={parsed.checkOut?.sheet_note}
        />
        <EventRow
          label="Late minutes"
          time={day.late_minutes > 0 ? String(day.late_minutes) : "—"}
        />
        <EventRow
          label="Shift window"
          time={parsed.shiftWindow ?? "—"}
        />
      </div>

      {parsed.breaks.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Break timeline (managers)
          </p>
          <div className="border border-border px-4 py-2">
            {parsed.breaks.map((event) => (
              <EventRow
                key={event.id}
                label={event.action}
                time={formatAttendanceTimeOnly(event.occurred_at, timezone)}
                note={event.sheet_note}
                muted
              />
            ))}
          </div>
        </section>
      ) : null}

      {day.sheet_note ? (
        <p className="text-sm text-muted-foreground">Sheet: {day.sheet_note}</p>
      ) : null}
    </div>
  );
}

export function adminStatusFromDay(day: AttendanceDay): AttendanceDayStatus {
  if (day.status === "break") return "present";
  return day.status;
}
