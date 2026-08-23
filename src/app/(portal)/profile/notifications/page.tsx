"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonDefault from "@/components/Button/ButtonDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import CredentialsModal from "@/components/Portal/CredentialsModal";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useApproveRequest } from "@/hooks/useApproveRequest";
import { useDenyRequest } from "@/hooks/useDenyRequest";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import {
  useAdminNotifications,
  useApproveAttendanceRequest,
  useAttendanceRequests,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useRejectAttendanceRequest,
} from "@/hooks/useAttendanceAdmin";
import type { AdminNotification } from "@/lib/api/attendance-admin";
import { authStorage } from "@/lib/auth-storage";
import type { ApproveCredentials } from "@/lib/types";
import { cn } from "@/utils/cn";
import { formatApiError } from "@/utils/portal-errors";

export default function ProfileNotificationsPage() {
  const isAdmin = authStorage.isAdmin();
  const { data, isLoading, isError, error } = usePendingRequests();
  const {
    data: notifications,
    isLoading: notificationsLoading,
    isError: notificationsError,
    error: notificationsFetchError,
  } = useAdminNotifications(false);
  const {
    data: attendanceRequests,
    isLoading: attendanceLoading,
    isError: attendanceError,
  } = useAttendanceRequests("pending");
  const approveRequest = useApproveRequest();
  const denyRequest = useDenyRequest();
  const approveAttendance = useApproveAttendanceRequest();
  const rejectAttendance = useRejectAttendanceRequest();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [credentials, setCredentials] = useState<ApproveCredentials | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  async function handleApprove(id: number) {
    setActionError(null);
    setProcessingId(id);
    try {
      const response = await approveRequest.mutateAsync(id);
      setCredentials(response.credentials);
    } catch (approveError) {
      setActionError(formatApiError(approveError));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeny(id: number) {
    setActionError(null);
    setProcessingId(id);
    try {
      await denyRequest.mutateAsync(id);
    } catch (denyError) {
      setActionError(formatApiError(denyError));
    } finally {
      setProcessingId(null);
    }
  }

  const requests = data?.data ?? [];
  const attendance = attendanceRequests ?? [];

  async function handleApproveAttendance(id: number) {
    setActionError(null);
    setProcessingId(id);
    try {
      await approveAttendance.mutateAsync({ id });
    } catch (approveError) {
      setActionError(formatApiError(approveError));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectAttendance(id: number) {
    setActionError(null);
    setProcessingId(id);
    try {
      await rejectAttendance.mutateAsync({ id });
    } catch (rejectError) {
      setActionError(formatApiError(rejectError));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleMarkRead(notification: AdminNotification) {
    if (notification.read_at) return;
    try {
      await markRead.mutateAsync(notification.id);
    } catch (readError) {
      setActionError(formatApiError(readError));
    }
  }

  async function handleMarkAllRead() {
    setActionError(null);
    try {
      await markAllRead.mutateAsync();
    } catch (readError) {
      setActionError(formatApiError(readError));
    }
  }

  return (
    <RequireAuth attendanceAccess guestAllowed={false}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            href="/command-center"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
          >
            ← Back to employees
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-foreground">
                Notifications
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Unread alerts, access requests, and attendance inbox.
              </p>
            </div>
            {unreadCount > 0 ? (
              <ButtonDefault
                type="button"
                size="sm"
                variant="outline"
                disabled={markAllRead.isPending}
                onClick={() => void handleMarkAllRead()}
              >
                Mark all read
              </ButtonDefault>
            ) : null}
          </div>
        </div>

        {actionError ? (
          <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-lg font-light text-foreground">Inbox</h2>

          {notificationsLoading ? (
            <EyeLoadingDefault size="md" label="Loading notifications" />
          ) : notificationsError ? (
            <p className="text-sm text-danger">
              {notificationsFetchError instanceof Error
                ? notificationsFetchError.message
                : "Failed to load notifications"}
            </p>
          ) : (notifications ?? []).length === 0 ? (
            <p className="rounded-sm border border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(notifications ?? []).map((notification) => (
                <article
                  key={notification.id}
                  className={cn(
                    "border border-border bg-surface p-5 transition-colors",
                    !notification.read_at && "border-warning/40 bg-warning/5",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => void handleMarkRead(notification)}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {notification.type.replace(/_/g, " ")}
                      </p>
                      <h3 className="mt-1 text-lg text-foreground">
                        {notification.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {new Date(notification.created_at).toLocaleString()}
                        {!notification.read_at ? " · unread" : null}
                      </p>
                    </button>
                    {notification.type === "attendance_request" ? (
                      <Link
                        href="/attendance"
                        className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
                      >
                        Open attendance →
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {isAdmin ? (
          <>
            {isLoading ? (
              <EyeLoadingDefault size="md" label="Loading access requests" />
            ) : isError ? (
              <p className="text-sm text-danger">
                {error instanceof Error ? error.message : "Failed to load requests"}
              </p>
            ) : requests.length === 0 ? (
              <p className="rounded-sm border border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
                No pending access requests.
              </p>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-light text-foreground">
                  Access requests
                </h2>
                {requests.map((request) => (
                  <article
                    key={request.id}
                    className="border border-border bg-surface p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg text-foreground">
                          {request.requester_name}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {request.profile.label} · {request.profile.company} ·{" "}
                          {request.profile.role_type.replace("_", " ")}
                        </p>
                        <p className="mt-3 text-sm text-foreground">
                          {request.reason}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          Submitted {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <ButtonDefault
                          type="button"
                          size="sm"
                          disabled={processingId === request.id}
                          onClick={() => void handleApprove(request.id)}
                        >
                          Approve
                        </ButtonDefault>
                        <ButtonDefault
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={processingId === request.id}
                          onClick={() => void handleDeny(request.id)}
                        >
                          Deny
                        </ButtonDefault>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-light text-foreground">
              Attendance requests
            </h2>
            <Link
              href="/attendance"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
            >
              Open attendance →
            </Link>
          </div>

          {attendanceLoading ? (
            <EyeLoadingDefault size="md" label="Loading attendance requests" />
          ) : attendanceError ? (
            <p className="text-sm text-danger">
              Failed to load attendance requests.
            </p>
          ) : attendance.length === 0 ? (
            <p className="rounded-sm border border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
              No pending attendance requests.
            </p>
          ) : (
            <div className="space-y-4">
              {attendance.map((request) => (
                <article
                  key={request.id}
                  className="border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {request.type} · {request.company}
                      </p>
                      <h3 className="mt-1 text-lg text-foreground">
                        {request.employee_name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.date}
                      </p>
                      <p className="mt-3 text-sm text-foreground">
                        {request.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ButtonDefault
                        type="button"
                        size="sm"
                        disabled={processingId === request.id}
                        onClick={() => void handleApproveAttendance(request.id)}
                      >
                        Approve
                      </ButtonDefault>
                      <ButtonDefault
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={processingId === request.id}
                        onClick={() => void handleRejectAttendance(request.id)}
                      >
                        Reject
                      </ButtonDefault>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <CredentialsModal
          open={Boolean(credentials)}
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      </div>
    </RequireAuth>
  );
}
