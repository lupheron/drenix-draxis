"use client";

import { useMemo, useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import ModalDefault from "@/components/UI/ModalDefault";
import { COMPANY_CODES, getCompanyLabel } from "@/constants/companies";
import {
  useApproveAttendanceRequest,
  useAttendanceDays,
  useAttendanceRequests,
  useRejectAttendanceRequest,
  useUpdateAttendanceDay,
} from "@/hooks/useAttendanceAdmin";
import type {
  AttendanceDay,
  AttendanceDayStatus,
  AttendanceRequest,
  CompanyCode,
} from "@/lib/types";
import { cn } from "@/utils/cn";
import { formatApiError } from "@/utils/portal-errors";

const STATUS_OPTIONS: { value: AttendanceDayStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "no_show", label: "No show" },
  { value: "break", label: "Break" },
  { value: "missing_punch", label: "Missing punch" },
  { value: "excused", label: "Excused" },
  { value: "pending_review", label: "Pending review" },
];

function statusLabel(status: AttendanceDayStatus | null | undefined) {
  if (!status) return "—";
  return status.replace(/_/g, " ");
}

function StatusPill({ status }: { status: AttendanceDayStatus | null | undefined }) {
  const tone =
    status === "present" || status === "excused"
      ? "text-success"
      : status === "late" || status === "pending_review"
        ? "text-warning"
        : status === "no_show" || status === "missing_punch"
          ? "text-danger"
          : "text-muted-foreground";

  return (
    <span className={cn("text-xs uppercase tracking-[0.12em]", tone)}>
      {statusLabel(status)}
    </span>
  );
}

type AdminAttendanceViewProps = {
  defaultCompany?: CompanyCode;
  from: string;
  to: string;
};

export default function AdminAttendanceView({
  defaultCompany = "JM",
  from,
  to,
}: AdminAttendanceViewProps) {
  const [tab, setTab] = useState<"days" | "requests">("days");
  const [company, setCompany] = useState<CompanyCode>(defaultCompany);
  const [statusFilter, setStatusFilter] = useState<AttendanceDayStatus | "">("");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<AttendanceDay | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceDayStatus>("present");
  const [editNote, setEditNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");
  const [activeRequest, setActiveRequest] = useState<AttendanceRequest | null>(
    null,
  );

  const daysQuery = useAttendanceDays(
    { company, from, to, status: statusFilter || undefined },
    tab === "days",
  );
  const requestsQuery = useAttendanceRequests("pending");
  const updateDay = useUpdateAttendanceDay();
  const approveRequest = useApproveAttendanceRequest();
  const rejectRequest = useRejectAttendanceRequest();

  const days = useMemo(() => {
    const rows = daysQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.employee_name.toLowerCase().includes(q));
  }, [daysQuery.data, search]);

  const requests = requestsQuery.data ?? [];

  function openDay(day: AttendanceDay) {
    setSelectedDay(day);
    setEditStatus(day.status);
    setEditNote(day.admin_note ?? "");
    setActionError(null);
  }

  async function saveDay() {
    if (!selectedDay) return;
    setActionError(null);
    try {
      await updateDay.mutateAsync({
        id: selectedDay.id,
        body: {
          status: editStatus,
          admin_note: editNote.trim() || undefined,
        },
      });
      setSelectedDay(null);
    } catch (error) {
      setActionError(formatApiError(error));
    }
  }

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
      <div className="flex flex-wrap gap-2 border border-border bg-surface p-1">
        {(
          [
            ["days", "Days"],
            ["requests", `Requests (${requests.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              tab === id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent-dim/50",
            )}
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

      {tab === "days" ? (
        <>
          <div className="flex flex-wrap gap-3 border border-border bg-surface p-5">
            <SelectDefault
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value as CompanyCode)}
              wrapperClassName="min-w-40"
              options={COMPANY_CODES.map((code) => ({
                value: code,
                label: `${code} — ${getCompanyLabel(code)}`,
              }))}
            />
            <SelectDefault
              label="Status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AttendanceDayStatus | "")
              }
              wrapperClassName="min-w-44"
              options={STATUS_OPTIONS}
            />
            <InputDefault
              label="Search employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              wrapperClassName="min-w-56"
            />
          </div>

          {daysQuery.isLoading ? (
            <EyeLoadingDefault size="md" label="Loading attendance days" />
          ) : daysQuery.isError ? (
            <p className="border border-danger/30 bg-danger/10 px-4 py-8 text-sm text-danger">
              Failed to load attendance days.
            </p>
          ) : days.length === 0 ? (
            <p className="border border-border bg-surface px-4 py-8 text-sm text-muted-foreground">
              No attendance days for {company} in {from} → {to}.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    {[
                      "Date",
                      "Employee",
                      "Status",
                      "Late min",
                      "No show",
                      "Sheet note",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr
                      key={day.id}
                      className="border-b border-border last:border-b-0 hover:bg-accent-dim/20"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {day.date}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {day.employee_name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={day.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {day.late_minutes || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {day.no_show ? "Yes" : "No"}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                        {day.sheet_note ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ButtonDefault
                          type="button"
                          size="sm"
                          variant="warning"
                          onClick={() => openDay(day)}
                        >
                          Edit
                        </ButtonDefault>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {requestsQuery.isLoading ? (
            <EyeLoadingDefault size="md" label="Loading requests" />
          ) : requestsQuery.isError ? (
            <p className="border border-danger/30 bg-danger/10 px-4 py-8 text-sm text-danger">
              Failed to load attendance requests.
            </p>
          ) : requests.length === 0 ? (
            <p className="border border-border bg-surface px-4 py-8 text-sm text-muted-foreground">
              No pending attendance requests.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {request.type} · {request.company}
                      </p>
                      <h2 className="mt-1 text-lg text-foreground">
                        {request.employee_name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.date} · {request.status}
                      </p>
                      <p className="mt-3 text-sm text-foreground">
                        {request.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ButtonDefault
                        type="button"
                        size="sm"
                        onClick={() => {
                          setActiveRequest(request);
                          setRequestComment("");
                          setActionError(null);
                        }}
                      >
                        Review
                      </ButtonDefault>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <ModalDefault
        open={Boolean(selectedDay)}
        title="Correct attendance day"
        description={
          selectedDay
            ? `${selectedDay.employee_name} · ${selectedDay.date}`
            : undefined
        }
        onClose={() => setSelectedDay(null)}
      >
        <div className="space-y-4">
          <SelectDefault
            label="Status"
            value={editStatus}
            onChange={(e) =>
              setEditStatus(e.target.value as AttendanceDayStatus)
            }
            options={STATUS_OPTIONS.filter((option) => option.value !== "")}
          />
          <InputDefault
            label="Admin note"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
          />
          {selectedDay?.sheet_note ? (
            <p className="text-sm text-muted-foreground">
              Sheet: {selectedDay.sheet_note}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <ButtonDefault
              type="button"
              variant="ghost"
              onClick={() => setSelectedDay(null)}
            >
              Cancel
            </ButtonDefault>
            <ButtonDefault
              type="button"
              disabled={updateDay.isPending}
              onClick={() => void saveDay()}
            >
              {updateDay.isPending ? "Saving…" : "Save correction"}
            </ButtonDefault>
          </div>
        </div>
      </ModalDefault>

      <ModalDefault
        open={Boolean(activeRequest)}
        title="Attendance request"
        onClose={() => setActiveRequest(null)}
      >
        {activeRequest ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">{activeRequest.message}</p>
            <InputDefault
              label="Comment for employee"
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
                disabled={rejectRequest.isPending}
                onClick={() => void resolveRequest("reject")}
              >
                Reject
              </ButtonDefault>
              <ButtonDefault
                type="button"
                disabled={approveRequest.isPending}
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
