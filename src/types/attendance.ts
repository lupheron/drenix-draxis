export type AttendanceEvent = {
  id: string;
  timestamp: string | null;
  name: string;
  action: string;
  shift: string | null;
  date: string;
  notes: string | null;
  flagged: boolean;
  lateMinutes: number | null;
  isNoShow: boolean;
};

export type AttendancePersonSummary = {
  name: string;
  events: number;
  noShows: number;
  lates: number;
  flagged: number;
};

export type AttendanceSummary = {
  totalEvents: number;
  checkIns: number;
  checkOuts: number;
  noShows: number;
  lates: number;
  flagged: number;
  byPerson: AttendancePersonSummary[];
};

export type AttendanceFetchResult = {
  company: string;
  sheetTab: string;
  data: AttendanceEvent[];
  summary: AttendanceSummary;
  error?: string;
};
