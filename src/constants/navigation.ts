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
        id: "shipments",
        label: "Shipments",
        href: "/platform/shipments",
        description: "Inbound and outbound flow",
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
