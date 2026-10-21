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

/** Active Sanctum token / device for an admin login (superadmin sessions UI). */
export type AdminDeviceSession = {
  id: number;
  admin_id: number;
  admin_username: string | null;
  admin_role: "super_admin" | "admin" | null;
  ip: string | null;
  user_agent: string | null;
  device_label: string | null;
  last_used_at: string | null;
  created_at: string | null;
  is_current: boolean;
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

export type MessageDirection = "inbound" | "outbound";

export type RingCentralMessageSummary = {
  total_messages: number;
  inbound: number;
  outbound: number;
  conversations_count: number;
};

export type RingCentralConversation = {
  id: string;
  peer_number: string;
  peer_name: string | null;
  last_message_at: string;
  last_preview: string;
  message_count: number;
  last_direction: MessageDirection | null;
};

export type RingCentralMessage = {
  id: number;
  external_id: string;
  conversation_id: string;
  direction: MessageDirection;
  body: string;
  from_number: string;
  to_number: string;
  sent_at: string;
  status: string | null;
};

export type RingCentralConversationsPage = {
  data: RingCentralConversation[];
  summary: RingCentralMessageSummary;
  meta: {
    from: string;
    to: string;
  };
};

export type RingCentralMessagesPage = {
  data: RingCentralMessage[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    from: string;
    to: string;
    conversation_id: string | null;
    direction: MessageDirection | null;
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
  messages_total: number;
  messages_inbound: number;
  messages_outbound: number;
  conversations_count: number;
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
  messages_total?: number;
  messages_inbound?: number;
  messages_outbound?: number;
  conversations_count?: number;
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
  /** Client Portal login username when issued (never includes password). */
  portal_username?: string | null;
  has_portal_access?: boolean;
  metrics?: EmployeeMetrics;
  /** Populated when backend includes attendance on GET /users */
  attendance?: EmployeeAttendanceSnapshot;
  created_at: string;
  updated_at: string;
};

export type AttendanceDayStatus =
  | "present"
  | "late"
  | "no_show"
  | "break"
  | "missing_punch"
  | "excused"
  | "pending_review";

export type AttendanceRequestType = "dispute" | "absence";
export type AttendanceRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "resolved";

export type EmployeeAttendanceSnapshot = {
  today_status: AttendanceDayStatus | null;
  late_count: number;
  no_show_count: number;
  open_requests: number;
};

export type AttendanceEventRecord = {
  id: number;
  employee_id: number;
  company: CompanyCode;
  /** UTC instant from sync (Time Local parsed as Asia/Tashkent). */
  occurred_at: string;
  action: string;
  /** Normalized when backend provides it: check_in | check_out | break */
  event_kind?: "check_in" | "check_out" | "break" | "other";
  shift: string | null;
  sheet_note: string | null;
  late_minutes: number | null;
  source: "sheet" | "manual";
};

export type AttendanceDay = {
  id: number;
  employee_id: number;
  /** May be blank from Laravel until denormalized — UI resolves via /users */
  employee_name: string | null;
  company: CompanyCode;
  /** Business shift day from sheet Shift Date column — not US calendar midnight. */
  date: string;
  status: AttendanceDayStatus;
  late_minutes: number;
  no_show: boolean;
  sheet_note: string | null;
  admin_note: string | null;
  corrected_by?: { id: number; username: string } | null;
  corrected_at?: string | null;
  events?: AttendanceEventRecord[];
};

export type AttendanceRequest = {
  id: number;
  type: AttendanceRequestType;
  status: AttendanceRequestStatus;
  employee_id: number;
  employee_name: string | null;
  company: CompanyCode;
  date: string;
  message: string;
  admin_comment: string | null;
  related_day_id: number | null;
  reviewed_by?: { id: number; username: string } | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceDaysListParams = {
  company?: CompanyCode | string;
  from?: string;
  to?: string;
  employee_id?: number | string;
  status?: AttendanceDayStatus | "";
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

export type PortalCredentialsPayload = {
  username: string;
  password: string;
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
  expires_at?: string;
};

export type DriverLeadStatusKey =
  | "rejected"
  | "n_a"
  | "follow_up"
  | "call_back"
  | "hired"
  | "not_valid"
  | "company_driver"
  | "lease_driver";

export type DriverLeadRecord = {
  id: number;
  board_name: string;
  group_title: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  status_key: DriverLeadStatusKey | string;
  notes: string | null;
  platform: string | null;
  position: string | null;
  state: string | null;
  recruiter: string | null;
  applied_on: string | null;
  contacted_on: string | null;
  columns: Record<string, string | null>;
};

export type DriverLeadSearchGroup = {
  name: string;
  phone: string | null;
  email: string | null;
  application_count: number;
  statuses: string[];
  history: DriverLeadRecord[];
};

export type DriverLeadSearchResponse = {
  found: boolean;
  message: string | null;
  data: DriverLeadSearchGroup[];
};

export type DriverLeadsBrowseMeta = {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  status: string | null;
  board: string | null;
};

export type DriverLeadsBrowseResponse = {
  data: DriverLeadRecord[];
  meta: DriverLeadsBrowseMeta;
};
