"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonDefault from "@/components/Button/ButtonDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useAcceptedUsers } from "@/hooks/useAcceptedUsers";
import { useRevokeAccess } from "@/hooks/useRevokeAccess";
import { formatApiError } from "@/utils/portal-errors";

export default function ProfileAcceptedPage() {
  const { data, isLoading, isError, error } = useAcceptedUsers();
  const revokeAccess = useRevokeAccess();
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleRevoke(id: number) {
    if (!window.confirm("Revoke access for this user?")) return;

    setActionError(null);
    setProcessingId(id);
    try {
      await revokeAccess.mutateAsync(id);
    } catch (revokeError) {
      setActionError(formatApiError(revokeError));
    } finally {
      setProcessingId(null);
    }
  }

  const users = data?.data ?? [];

  return (
    <RequireAuth adminOnly guestAllowed={false}>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href="/command-center"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
          >
            ← Back to employees
          </Link>
          <h1 className="mt-4 text-3xl font-light tracking-wide text-foreground">
            Accepted users
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Approved, revoked, and expired guest access accounts.
          </p>
        </div>

        {actionError ? (
          <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        ) : null}

        {isLoading ? (
          <EyeLoadingDefault size="md" label="Loading" />
        ) : isError ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
        ) : users.length === 0 ? (
          <p className="rounded-sm border border-border bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
            No accepted access requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {[
                    "Name",
                    "Profile",
                    "Status",
                    "Username",
                    "Expires",
                    "Reviewed by",
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
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {user.requester_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.profile.label} ({user.profile.company})
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {user.status}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.account?.username ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.expires_at
                        ? new Date(user.expires_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.reviewed_by?.username ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {user.status === "approved" ? (
                        <ButtonDefault
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={processingId === user.id}
                          onClick={() => void handleRevoke(user.id)}
                        >
                          Revoke
                        </ButtonDefault>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
