import type { NavSection } from "@/types/navigation";

export const PLATFORM_NAV: NavSection[] = [
  {
    id: "operations",
    title: "Operations",
    items: [
      {
        id: "command-center",
        label: "Command Center",
        href: "/platform",
        description: "Unified operational picture",
      },
      {
        id: "fleet",
        label: "Fleet",
        href: "/platform/fleet",
        description: "Active units and telemetry",
      },
      {
        id: "shipments",
        label: "Shipments",
        href: "/platform/shipments",
        description: "Inbound and outbound flow",
      },
      {
        id: "routes",
        label: "Routes",
        href: "/platform/routes",
        description: "Path intelligence and optimization",
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    items: [
      {
        id: "warehouses",
        label: "Warehouses",
        href: "/platform/warehouses",
        description: "Storage nodes and capacity",
      },
      {
        id: "network",
        label: "Network",
        href: "/platform/network",
        description: "Connection topology and latency",
      },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/platform/analytics",
        description: "Pattern detection and forecasting",
      },
      {
        id: "alerts",
        label: "Alerts",
        href: "/platform/alerts",
        description: "Exceptions and risk signals",
      },
    ],
  },
];
