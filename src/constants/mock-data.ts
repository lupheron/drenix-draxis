import type { Alert, FleetUnit, Shipment, StatMetric } from "@/types/logistics";

export const OVERVIEW_STATS: StatMetric[] = [
  {
    id: "active-shipments",
    label: "Active Shipments",
    value: "1,284",
    change: "+12% vs last week",
    trend: "up",
  },
  {
    id: "fleet-online",
    label: "Fleet Online",
    value: "342 / 360",
    change: "94.4% availability",
    trend: "neutral",
  },
  {
    id: "on-time",
    label: "On-Time Delivery",
    value: "97.2%",
    change: "+0.8% improvement",
    trend: "up",
  },
  {
    id: "exceptions",
    label: "Open Exceptions",
    value: "17",
    change: "3 critical",
    trend: "down",
  },
];

export const MOCK_FLEET: FleetUnit[] = [
  {
    id: "fl-001",
    identifier: "MFG-TRK-0142",
    type: "truck",
    status: "active",
    location: "I-80 East · Nebraska",
    lastSignal: "2026-06-18T22:14:00Z",
  },
  {
    id: "fl-002",
    identifier: "MFG-VAN-0088",
    type: "van",
    status: "idle",
    location: "Chicago Hub · Dock 7",
    lastSignal: "2026-06-18T21:58:00Z",
  },
  {
    id: "fl-003",
    identifier: "MFG-CNT-0201",
    type: "container",
    status: "active",
    location: "Port of Oakland · Berth 12",
    lastSignal: "2026-06-18T22:01:00Z",
  },
  {
    id: "fl-004",
    identifier: "MFG-TRK-0099",
    type: "truck",
    status: "maintenance",
    location: "Denver Service Center",
    lastSignal: "2026-06-18T18:30:00Z",
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "sh-001",
    reference: "MF-2026-88421",
    origin: "Rotterdam, NL",
    destination: "Chicago, US",
    status: "in_transit",
    eta: "2026-06-21T14:00:00Z",
    carrier: "North Atlantic Line",
  },
  {
    id: "sh-002",
    reference: "MF-2026-88419",
    origin: "Shanghai, CN",
    destination: "Los Angeles, US",
    status: "delayed",
    eta: "2026-06-23T09:30:00Z",
    carrier: "Pacific Meridian",
  },
  {
    id: "sh-003",
    reference: "MF-2026-88415",
    origin: "Dallas, US",
    destination: "Atlanta, US",
    status: "delivered",
    eta: "2026-06-18T16:45:00Z",
    carrier: "Meridian Ground",
  },
  {
    id: "sh-004",
    reference: "MF-2026-88408",
    origin: "Hamburg, DE",
    destination: "New York, US",
    status: "pending",
    eta: "2026-06-25T11:00:00Z",
    carrier: "Atlantic Express",
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "al-001",
    title: "Route deviation detected",
    message: "Unit MFG-TRK-0142 departed planned corridor by 14km.",
    severity: "critical",
    timestamp: "2026-06-18T22:10:00Z",
    source: "Route Intelligence",
  },
  {
    id: "al-002",
    title: "Warehouse capacity threshold",
    message: "Chicago Hub approaching 92% storage utilization.",
    severity: "warning",
    timestamp: "2026-06-18T21:45:00Z",
    source: "Warehouse Monitor",
  },
  {
    id: "al-003",
    title: "Customs clearance pending",
    message: "Shipment MF-2026-88408 awaiting documentation review.",
    severity: "info",
    timestamp: "2026-06-18T20:30:00Z",
    source: "Compliance Engine",
  },
];
