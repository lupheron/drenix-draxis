"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { themeTokens, useLeadsTheme } from "@/components/LeadsDashboard/theme";

export function LeadCard({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const theme = useLeadsTheme();
  const tokens = themeTokens[theme];

  if (theme === "draxis") {
    return (
      <div
        className={cn("rounded-sm p-5", tokens.card, className)}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("ld-card", className)} style={style}>
      {children}
    </div>
  );
}

export function SummaryPills({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  const theme = useLeadsTheme();

  if (theme === "draxis") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-sm border border-border bg-accent-dim/40 px-3 py-1.5 text-center"
          >
            <div className="text-base font-semibold text-foreground">
              {item.value}
            </div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
      {items.map((item) => (
        <div key={item.label} className="ld-pill">
          <div className="ld-pill-value">{item.value}</div>
          <div className="ld-pill-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ChartFrame({
  title,
  subtitle,
  badge,
  legend,
  children,
  pills,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  legend?: ReactNode;
  children: ReactNode;
  pills?: Array<{ label: string; value: string }>;
}) {
  const theme = useLeadsTheme();
  const tokens = themeTokens[theme];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={theme === "draxis" ? "text-sm font-medium text-foreground" : undefined}
            style={
              theme === "standalone"
                ? { fontSize: 13, fontWeight: 600, color: tokens.title }
                : undefined
            }
          >
            {title}
          </div>
          {badge ? (
            theme === "draxis" ? (
              <span className="rounded-sm border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                {badge}
              </span>
            ) : (
              <span className={tokens.badge}>{badge}</span>
            )
          ) : null}
        </div>
        {subtitle ? (
          <p
            className={theme === "draxis" ? "mt-1 text-xs text-muted-foreground" : undefined}
            style={
              theme === "standalone"
                ? { fontSize: 11, color: tokens.subtitle, marginTop: 2 }
                : undefined
            }
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {legend ? (
        <div className="mb-2 flex flex-wrap gap-3">{legend}</div>
      ) : null}
      <div className="relative min-h-0 flex-1">{children}</div>
      {pills ? <SummaryPills items={pills} /> : null}
    </div>
  );
}

export function LegendDot({
  color,
  label,
  dash,
}: {
  color: string;
  label: string;
  dash?: boolean;
}) {
  const theme = useLeadsTheme();
  const textColor = theme === "draxis" ? "text-muted-foreground" : undefined;

  return (
    <div
      className={cn("flex items-center gap-1.5 text-xs", textColor)}
      style={
        theme === "standalone"
          ? { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151" }
          : undefined
      }
    >
      <svg width="18" height="10" style={{ flexShrink: 0 }}>
        <line
          x1="0"
          y1="5"
          x2="18"
          y2="5"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={dash ? "4 3" : undefined}
        />
      </svg>
      {label}
    </div>
  );
}

export function LegendBar({ color, label }: { color: string; label: string }) {
  const theme = useLeadsTheme();

  return (
    <div
      className={theme === "draxis" ? "flex items-center gap-1.5 text-xs text-muted-foreground" : undefined}
      style={
        theme === "standalone"
          ? {
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#374151",
            }
          : undefined
      }
    >
      <span
        className="inline-block h-2 w-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </div>
  );
}

export function CardTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const theme = useLeadsTheme();

  if (theme === "draxis") {
    return (
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{title}</div>
      {subtitle ? (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{subtitle}</div>
      ) : null}
    </div>
  );
}
