"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeadsDataRow } from "@/types/leads";
import { SECTIONS, type SectionId } from "@/components/LeadsDashboard/constants";
import { LeadsSectionContent } from "@/components/LeadsDashboard/LeadsSectionContent";
import { LeadsThemeContext } from "@/components/LeadsDashboard/theme";
import "@/components/LeadsDashboard/leads-dashboard.css";

type LeadDashboardProps = {
  data: LeadsDataRow[];
  error?: string;
  company?: string;
};

export default function LeadDashboard({
  data,
  error,
  company = "JM",
}: LeadDashboardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState<SectionId>("overview");

  const activeSection = useMemo(
    () => SECTIONS.find((item) => item.id === section) ?? SECTIONS[0],
    [section],
  );

  return (
    <LeadsThemeContext.Provider value="standalone">
      <div className="ld-shell">
        <nav
          className={`ld-sidebar${collapsed ? " collapsed" : ""}`}
          style={mobileOpen ? { width: 220, minWidth: 220 } : undefined}
        >
          <div className="ld-sidebar-logo">
            <div className="ld-sidebar-logo-mark">{company}</div>
            <div className="ld-sidebar-logo-text">{company} Lead Analytics</div>
          </div>

          <div className="ld-nav">
            <div className="ld-nav-section-label">Analytics</div>
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                className={`ld-nav-item${section === item.id ? " active" : ""}`}
                onClick={() => {
                  setSection(item.id);
                  setMobileOpen(false);
                }}
              >
                <span className="ld-nav-icon">{item.icon}</span>
                <span className="ld-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="ld-sidebar-footer">
            <button
              type="button"
              className="ld-nav-item"
              title="Collapse sidebar"
              onClick={() => setCollapsed((value) => !value)}
            >
              <span className="ld-nav-icon">{collapsed ? "→" : "←"}</span>
              <span className="ld-nav-label">Collapse</span>
            </button>
            <Link href="/analytics" className="ld-nav-item" title="Back to DRAXIS">
              <span className="ld-nav-icon">⌂</span>
              <span className="ld-nav-label">DRAXIS Analytics</span>
            </Link>
          </div>
        </nav>

        <div className="ld-right">
          <div className="ld-topbar">
            <button
              type="button"
              className="ld-toggle-btn"
              onClick={() => setMobileOpen((value) => !value)}
            >
              ☰
            </button>
            <div className="ld-breadcrumb">
              <span>{company} Lead Analytics</span>
              <span className="ld-breadcrumb-sep">/</span>
              <span className="ld-breadcrumb-active">{activeSection.label}</span>
            </div>
            <div className="ld-topbar-title">{company} — Lead Analytics</div>
          </div>

          <main className="ld-main">
            {error ? (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(226,75,74,0.08)",
                  border: "1px solid rgba(226,75,74,0.25)",
                  color: "#991b1b",
                  fontSize: 12,
                }}
              >
                Live sheet unavailable ({error}). Showing fallback sample data.
              </div>
            ) : null}

            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700 }}>
                {activeSection.label}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                {activeSection.desc}
              </p>
            </div>

            <LeadsSectionContent id={section} data={data} />
          </main>
        </div>
      </div>
    </LeadsThemeContext.Provider>
  );
}
