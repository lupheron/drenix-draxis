"use client";

import Link from "next/link";
import { useState } from "react";
import AttendanceTimezoneToggle from "@/components/Attendance/AttendanceTimezoneToggle";
import ButtonDefault from "@/components/Button/ButtonDefault";
import DatePickerDefault from "@/components/FormItems/DatePicker/DatePickerDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { getCompanyLabel } from "@/constants/companies";
import { useAttendanceDashboard } from "@/hooks/useAttendanceDashboard";
import { useAttendanceTimezone } from "@/hooks/useAttendanceTimezone";
import {
  useApproveAttendanceRequest,
  useAttendanceRequests,
  useRejectAttendanceRequest,
} from "@/hooks/useAttendanceAdmin";
import type { AttendanceRequest, CompanyCode } from "@/lib/types";
import type { AttendanceSummaryStats } from "@/utils/attendance-display";
import { getDateRangeForPreset } from "@/utils/date-ranges";
import { formatApiError } from "@/utils/portal-errors";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import ModalDefault from "@/components/UI/ModalDefault";

export default function AttendanceDashboard() {
  const { timezone, setTimezone } = useAttendanceTimezone();
  const monthRange = getDateRangeForPreset("month");
  const [customFrom, setCustomFrom] = useState(monthRange.from);
  const [customTo, setCustomTo] = useState(monthRange.to);
  const [tab, setTab] = useState<"dashboard" | "requests">("dashboard");
  const [activeRequest, setActiveRequest] = useState<AttendanceRequest | null>(
    null,
  );
  const [requestComment, setRequestComment] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { periods, isLoading } = useAttendanceDashboard(customFrom, customTo);
  const requestsQuery = useAttendanceRequests("pending");
  const approveRequest = useApproveAttendanceRequest();
  const rejectRequest = useRejectAttendanceRequest();
  const requests = requestsQuery.data ?? [];

  async function resolveRequest(action: "approve" | "reject") {
    if (!activeRequest) return;
    setActionError(null);
    try {
      if (action === "approve") {
        await approveRequest.mutateAsync({
          id: activeRequest.id,
          comment: requestComment.trim() || undefined,
        });
      } else {
        await rejectRequest.mutateAsync({
          id: activeRequest.id,
          comment: requestComment.trim() || undefined,
        });
      }
      setActiveRequest(null);
      setRequestComment("");
    } catch (error) {
      setActionError(formatApiError(error));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border border-border bg-surface px-5 py-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Company attendance overview by shift date — Today, week, month, and
          custom range shown together. Face ID desk in Tashkent; business
          calendar US Central.
        </p>
        <AttendanceTimezoneToggle timezone={timezone} onChange={setTimezone} />
      </div>

      <div className="flex flex-wrap gap-2 border border-border bg-surface p-1">
        {(
          [
            ["dashboard", "Dashboard"],
            ["requests", `Requests (${requests.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "bg-foreground px-4 py-2 text-sm text-background"
                : "px-4 py-2 text-sm text-muted-foreground hover:bg-accent-dim/50"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {actionError ? (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {actionError}
        </p>
      ) : null}

      {tab === "dashboard" ? (
        <>
          <div className="flex flex-wrap items-end gap-5 border border-border bg-surface p-5">
            <DatePickerDefault
              label="Custom from"
              value={customFrom}
              onChange={setCustomFrom}
              wrapperClassName="min-w-[16rem]"
            />
            <DatePickerDefault
              label="Custom to"
              value={customTo}
              onChange={setCustomTo}
              min={customFrom}
              wrapperClassName="min-w-[16rem]"
            />
          </div>

          {isLoading ? (
            <EyeLoadingDefault size="lg" label="Loading attendance overview" />
          ) : (
            <div className="space-y-10">
              {periods.map((period) => (
                <section key={period.key} className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-light text-foreground">
                        {period.label}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {period.from} → {period.to}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {period.companies.map((snapshot) => (
                      <CompanyAttendanceCard
                        key={`${period.key}-${snapshot.company}`}
                        company={snapshot.company}
                        stats={snapshot.stats}
                        periodLabel={period.label}
                        from={period.from}
                        to={period.to}
                        isError={snapshot.isError}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <RequestsInbox
          requests={requests}
          isLoading={requestsQuery.isLoading}
          isError={requestsQuery.isError}
          onReview={setActiveRequest}
        />
      )}

      <ModalDefault
        open={Boolean(activeRequest)}
        title="Attendance request"
        onClose={() => setActiveRequest(null)}
      >
        {activeRequest ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Shift date {activeRequest.date} ·{" "}
              {activeRequest.employee_name?.trim() ||
                `Employee #${activeRequest.employee_id}`}
            </p>
            <p className="text-sm text-foreground">{activeRequest.message}</p>
            <InputDefault
              label="Comment"
              value={requestComment}
              onChange={(e) => setRequestComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <ButtonDefault
                type="button"
                variant="ghost"
                onClick={() => setActiveRequest(null)}
              >
                Cancel
              </ButtonDefault>
              <ButtonDefault
                type="button"
                variant="danger"
                onClick={() => void resolveRequest("reject")}
              >
                Reject
              </ButtonDefault>
              <ButtonDefault
                type="button"
                onClick={() => void resolveRequest("approve")}
              >
                Approve
              </ButtonDefault>
            </div>
          </div>
        ) : null}
      </ModalDefault>
    </div>
  );
}

function CompanyAttendanceCard({
  company,
  stats,
  periodLabel,
  from,
  to,
  isError,
}: {
  company: CompanyCode;
  stats: AttendanceSummaryStats;
  periodLabel: string;
  from: string;
  to: string;
  isError: boolean;
}) {
  if (isError) {
    return (
      <div className="border border-danger/30 bg-danger/5 p-5">
        <p className="text-sm text-danger">
          Failed to load {company} for {periodLabel.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {company}
          </p>
          <h3 className="mt-1 text-base text-foreground">
            {getCompanyLabel(company)}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.uniqueEmployees} employees · {stats.totalDayRows} shift days
          </p>
        </div>
        <Link
          href={`/attendance/manage?company=${company}&from=${from}&to=${to}`}
          className="text-[10px] uppercase tracking-[0.15em] text-muted hover:text-foreground"
        >
          Manage →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat label="Checked in" value={stats.checkedIn} />
        <MiniStat label="Late" value={stats.late} tone="warning" />
        <MiniStat label="No show" value={stats.noShow} tone="danger" />
        <MiniStat label="Pending" value={stats.pending} />
      </div>
    </article>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning" | "danger";
}) {
  return (
    <div className="border border-border bg-surface-elevated/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted">
        {label}
      </p>
      <p
        className={
          tone === "danger"
            ? "mt-1 text-lg text-danger"
            : tone === "warning"
              ? "mt-1 text-lg text-warning"
              : "mt-1 text-lg text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

function RequestsInbox({
  requests,
  isLoading,
  isError,
  onReview,
}: {
  requests: AttendanceRequest[];
  isLoading: boolean;
  isError: boolean;
  onReview: (request: AttendanceRequest) => void;
}) {
  if (isLoading) {
    return <EyeLoadingDefault size="md" label="Loading requests" />;
  }
  if (isError) {
    return (
      <p className="text-sm text-danger">Failed to load attendance requests.</p>
    );
  }
  if (requests.length === 0) {
    return (
      <p className="border border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
        No pending attendance requests.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <article
          key={request.id}
          className="flex flex-wrap items-start justify-between gap-4 border border-border bg-surface p-5"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {request.type} · {request.company}
            </p>
            <h3 className="mt-1 text-lg text-foreground">
              {request.employee_name?.trim() ||
                `Employee #${request.employee_id}`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Shift date {request.date}
            </p>
            <p className="mt-2 text-sm text-foreground">{request.message}</p>
          </div>
          <ButtonDefault type="button" size="sm" onClick={() => onReview(request)}>
            Review
          </ButtonDefault>
        </article>
      ))}
    </div>
  );
}
