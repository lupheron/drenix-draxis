"use client";

import type { LeadsDataRow } from "@/types/leads";
import { CardTitle } from "@/components/LeadsDashboard/ui";
import { useLeadsTheme } from "@/components/LeadsDashboard/theme";
import { cn } from "@/utils/cn";

const STREAMS = [
  { label: "Leads", key: "hired_by_leads" as const, bg: "bg-sky-400", light: "bg-sky-400/15" },
  { label: "Lead Base", key: "hired_by_leadbase" as const, bg: "bg-violet-400", light: "bg-violet-400/15" },
  { label: "Referral", key: "hired_by_referral" as const, bg: "bg-amber-400", light: "bg-amber-400/15" },
];

export default function HireRateBreakdownCard({
  data,
}: {
  data: LeadsDataRow[];
}) {
  const theme = useLeadsTheme();

  if (data.length === 0) return null;

  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
  const totalHired = data.reduce((sum, row) => sum + row.hired, 0);
  const overallRate = totalLeads > 0 ? (totalHired / totalLeads) * 100 : 0;
  const period = `${data[0].month} – ${data[data.length - 1].month}`;

  const streams = STREAMS.map((stream) => {
    const count = data.reduce((sum, row) => sum + row[stream.key], 0);
    const share = totalHired > 0 ? (count / totalHired) * 100 : 0;
    return { ...stream, count, share };
  });

  return (
    <div className="flex h-full flex-col gap-3">
      <CardTitle
        title="Hiring rate by source"
        subtitle={`How well we convert & which source drives hires · ${period}`}
      />

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-sm p-4",
          theme === "draxis"
            ? "border border-sky-500/20 bg-gradient-to-br from-sky-950/60 to-violet-950/40"
            : undefined,
        )}
        style={
          theme === "standalone"
            ? {
                background: "linear-gradient(135deg, #185FA5 0%, #534AB7 100%)",
                borderRadius: 10,
                padding: "14px 18px",
              }
            : undefined
        }
      >
        <div>
          <div className="text-4xl font-bold leading-none text-white">
            {overallRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-white/75">Overall hire rate</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{totalHired}</div>
          <div className="mt-0.5 text-[10px] text-white/70">total hired</div>
        </div>
      </div>

      <div className="space-y-2">
        {streams.map((stream) => (
          <div key={stream.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-foreground">{stream.label}</span>
              <span className="text-muted-foreground">
                {stream.count} · {stream.share.toFixed(1)}%
              </span>
            </div>
            <div
              className={cn(
                "h-1.5 overflow-hidden rounded-full",
                theme === "draxis" ? stream.light : undefined,
              )}
              style={
                theme === "standalone"
                  ? {
                      height: 6,
                      background: "rgba(29,158,117,0.1)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }
                  : undefined
              }
            >
              <div
                className={cn("h-full rounded-full", theme === "draxis" ? stream.bg : undefined)}
                style={{
                  width: `${Math.min(stream.share, 100)}%`,
                  ...(theme === "standalone"
                    ? {
                        background:
                          stream.label === "Leads"
                            ? "#1D9E75"
                            : stream.label === "Lead Base"
                              ? "#185FA5"
                              : "#BA7517",
                      }
                    : {}),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
