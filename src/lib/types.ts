export type CompanyCode = "JM" | "WF" | "BP";

export type AccessProfile = {
  id: number;
  label: string;
  company: CompanyCode;
  role_type: "ceo" | "head_hr";
};

export type AccessRequest = {
  id: number;
  access_profile_id: number;
  requester_name: string;
  reason: string;
  status: "pending" | "approved" | "denied" | "revoked" | "expired";
  profile: AccessProfile;
  reviewed_by?: { id: number; username: string; role: string };
  reviewed_at?: string;
  expires_at?: string;
  account?: {
    id: number;
    username: string;
    expires_at: string;
    revoked_at: string | null;
  };
  created_at: string;
  updated_at: string;
};

export type Admin = {
  id: number;
  username: string;
  role: "super_admin" | "admin";
  created_at: string;
  updated_at: string;
};

export type EmployeeShift = "morning" | "afternoon" | "night" | "flexible";

export type EmployeeStatus = "normal" | "close_monitor";

export type DepartmentSlug = "hr" | "safety";

export type CallType = "outbound" | "inbound" | "missed" | "voicemail" | "other";

export type RingCentralSummary = {
  total_calls: number;
  outbound: number;
  inbound: number;
  missed: number;
  voicemail: number;
  other: number;
  minutes_total: number;
  minutes_outbound: number;
  minutes_inbound: number;
  date?: string | null;
};

export type RingCentralCall = {
  id: number;
  external_id: string;
  started_at: string;
  duration_seconds: number;
  duration_minutes: number;
  direction: string | null;
  result: string | null;
  call_type: CallType;
  action: string | null;
};

export type RingCentralOverview = {
  user_id: number;
  from: string;
  to: string;
  summary: RingCentralSummary;
  daily: RingCentralSummary[];
};

export type RingCentralCallsPage = {
  data: RingCentralCall[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    from: string;
    to: string;
    type: CallType | null;
  };
};

export type EmployeeMetrics = {
  minutes_on_call: number;
  calls_made: number;
  outbound_calls: number;
  inbound_calls: number;
  missed_calls: number;
  voicemail_calls: number;
  other_calls: number;
  outbound_minutes: number;
  inbound_minutes: number;
  lates: number;
  leads: number;
  follow_up: number;
  hires: number;
  loaded: number;
  rejected: number;
  ringcentral?: RingCentralSummary;
};

/** Numeric metric keys usable as table/modal columns (excludes nested objects). */
export type MetricField = Exclude<keyof EmployeeMetrics, "ringcentral">;

export type DailyMetric = EmployeeMetrics & {
  date: string;
};

export type CompanyHrAnalytics = {
  company: CompanyCode;
  employee_count: number;
  minutes_on_call: number;
  calls_made: number;
  outbound_calls?: number;
  inbound_calls?: number;
  missed_calls?: number;
  voicemail_calls?: number;
  other_calls?: number;
  outbound_minutes?: number;
  inbound_minutes?: number;
  lates: number;
  leads: number;
  follow_up: number;
  hires: number;
  loaded: number;
  rejected: number;
  by_employee: (Employee & { metrics?: EmployeeMetrics })[];
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  joined_at: string;
  shift: EmployeeShift;
  salary?: number;
  grade: string;
  status: EmployeeStatus;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  department: string;
  position?: string | null;
  company?: string | null;
  metrics?: EmployeeMetrics;
  created_at: string;
  updated_at: string;
};

export type UsersListParams = {
  company?: CompanyCode | string;
  department?: DepartmentSlug | string;
  from?: string;
  to?: string;
};

export type EmployeePayload = {
  first_name: string;
  last_name: string;
  birth_date: string;
  joined_at: string;
  shift: EmployeeShift;
  salary: number;
  grade: string;
  status: EmployeeStatus;
  department: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  position?: string | null;
  company?: string | null;
};

export type AdminSession = {
  token: string;
  user_type: "admin";
  role: "super_admin" | "admin";
  admin: { id: number; username: string; role: "super_admin" | "admin" };
};

export type AccessSession = {
  token: string;
  user_type: "access";
  expires_at: string;
  profile: { label: string; company: CompanyCode; role_type: "ceo" | "head_hr" };
};

export type ApproveCredentials = {
  username: string;
  password: string;
  expires_at: string;
};
