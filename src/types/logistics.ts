export type ShipmentStatus =
  | "in_transit"
  | "delivered"
  | "delayed"
  | "pending"
  | "exception";

export type FleetUnit = {
  id: string;
  identifier: string;
  type: "truck" | "van" | "container" | "air";
  status: "active" | "idle" | "maintenance" | "offline";
  location: string;
  lastSignal: string;
};

export type Shipment = {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta: string;
  carrier: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  source: string;
};

export type StatMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
};
