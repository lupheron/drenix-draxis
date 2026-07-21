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
import type { ApproveCredentials } from "@/lib/types";
import { formatApiError } from "@/utils/portal-errors";

export default function ProfileNotificationsPage() {
  const { data, isLoading, isError, error } = usePendingRequests();
  const approveRequest = useApproveRequest();
  const denyRequest = useDenyRequest();

  const [credentials, setCredentials] = useState<ApproveCredentials | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

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

  return (
    <RequireAuth adminOnly guestAllowed={false}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            href="/command-center"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
          >
            ← Back to employees
          </Link>
          <h1 className="mt-4 text-3xl font-light tracking-wide text-foreground">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review pending access requests. On approve, share credentials with
            the requester in person at the office.
          </p>
        </div>

        {actionError ? (
          <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        ) : null}

        {isLoading ? (
          <EyeLoadingDefault size="md" label="Loading requests" />
        ) : isError ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : "Failed to load requests"}
          </p>
        ) : requests.length === 0 ? (
          <p className="rounded-sm border border-border bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
            No pending access requests.
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

        <CredentialsModal
          open={Boolean(credentials)}
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      </div>
    </RequireAuth>
  );
}
