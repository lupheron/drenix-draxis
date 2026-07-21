"use client";

import type { LeadsDataRow } from "@/types/leads";
import { CardTitle } from "@/components/LeadsDashboard/ui";
import { useLeadsTheme } from "@/components/LeadsDashboard/theme";
import { cn } from "@/utils/cn";

export default function HireRateSummaryCard({ data }: { data: LeadsDataRow[] }) {
  const theme = useLeadsTheme();

  if (data.length === 0) return null;

  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
  const hiredFromLeads = data.reduce((sum, row) => sum + row.hired_by_leads, 0);
  const totalSpend = data.reduce((sum, row) => sum + row.ad_spend_usd, 0);
  const rate = totalLeads > 0 ? (hiredFromLeads / totalLeads) * 100 : 0;
  const cph = hiredFromLeads > 0 ? Math.round(totalSpend / hiredFromLeads) : 0;
  const period = `${data[0].month} – ${data[data.length - 1].month}`;
  const avgLeads = Math.round(totalLeads / data.length);

  const stats = [
    { label: "Total leads", value: totalLeads.toLocaleString() },
    { label: "Avg leads / mo", value: String(avgLeads) },
    { label: "Avg cost / hire", value: `$${cph.toLocaleString()}` },
    {
      label: "Total ad spend",
      value: `$${Math.round(totalSpend).toLocaleString()}`,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      <CardTitle
        title="Lead → hire conversion"
        subtitle={`Leads only — not Lead Base or Referral · ${period}`}
      />

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-sm p-4",
          theme === "draxis"
            ? "border border-emerald-500/20 bg-gradient-to-br from-emerald-950/70 to-emerald-900/30"
            : undefined,
        )}
        style={
          theme === "standalone"
            ? {
                background: "linear-gradient(135deg, #085041 0%, #1D9E75 100%)",
                borderRadius: 10,
                padding: "14px 18px",
              }
            : undefined
        }
      >
        <div>
          <div className="text-4xl font-bold leading-none text-white">
            {rate.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-white/75">Lead → hire rate</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{hiredFromLeads}</div>
          <div className="mt-0.5 text-[10px] text-white/70">hired from leads</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-sm p-2.5",
              theme === "draxis"
                ? "border border-border bg-accent-dim/30"
                : undefined,
            )}
            style={
              theme === "standalone"
                ? {
                    background: "rgba(29,158,117,0.08)",
                    border: "0.5px solid #c2e8d6",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }
                : undefined
            }
          >
            <div
              className={cn(
                "text-base font-bold",
                theme === "draxis" ? "text-foreground" : undefined,
              )}
              style={
                theme === "standalone"
                  ? { fontSize: 15, fontWeight: 700, color: "#085041" }
                  : undefined
              }
            >
              {item.value}
            </div>
            <div
              className={cn(
                "mt-0.5 text-[10px]",
                theme === "draxis" ? "text-muted-foreground" : undefined,
              )}
              style={
                theme === "standalone"
                  ? { fontSize: 10, color: "#6b7280", marginTop: 2 }
                  : undefined
              }
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
