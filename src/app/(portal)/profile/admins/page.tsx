"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import ModalDefault from "@/components/UI/ModalDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useAdmins } from "@/hooks/useAdmins";
import { useCreateAdmin } from "@/hooks/useCreateAdmin";
import { useDeleteAdmin } from "@/hooks/useDeleteAdmin";
import {
  useAdminSessions,
  useRevokeAdminSession,
  useRevokeAdminSessions,
  useRevokeMyOtherSessions,
  useUpdateAdminPassword,
  useUpdateAdminUsername,
} from "@/hooks/useAdminSessions";
import type { Admin } from "@/lib/types";
import { formatApiError } from "@/utils/portal-errors";

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function ProfileAdminsPage() {
  const { data, isLoading, isError, error } = useAdmins();
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const updateUsername = useUpdateAdminUsername();
  const updatePassword = useUpdateAdminPassword();
  const revokeSession = useRevokeAdminSession();
  const revokeAllForAdmin = useRevokeAdminSessions();
  const revokeMyOthers = useRevokeMyOtherSessions();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string>("");
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [passwordAdmin, setPasswordAdmin] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credError, setCredError] = useState<string | null>(null);

  const filterAdminId = sessionFilter ? Number(sessionFilter) : null;
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErr,
  } = useAdminSessions(filterAdminId);

  const admins = data?.data ?? [];
  const sessions = sessionsData?.data ?? [];

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await createAdmin.mutateAsync({
        username: username.trim(),
        password,
        role: "admin",
      });
      setUsername("");
      setPassword("");
      setActionMessage("Admin created.");
    } catch (createError) {
      setFormError(formatApiError(createError));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Remove this admin?")) return;
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteAdmin.mutateAsync(id);
      setActionMessage("Admin deleted.");
    } catch (deleteError) {
      setActionError(formatApiError(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveUsername(event: React.FormEvent) {
    event.preventDefault();
    if (!editAdmin) return;
    setCredError(null);
    try {
      await updateUsername.mutateAsync({
        id: editAdmin.id,
        username: editUsername.trim(),
      });
      setEditAdmin(null);
      setActionMessage("Username updated.");
    } catch (err) {
      setCredError(formatApiError(err));
    }
  }

  async function handleSavePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!passwordAdmin) return;
    setCredError(null);
    if (newPassword !== confirmPassword) {
      setCredError("Passwords do not match.");
      return;
    }
    try {
      const result = await updatePassword.mutateAsync({
        id: passwordAdmin.id,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordAdmin(null);
      setNewPassword("");
      setConfirmPassword("");
      setActionMessage(result.message || "Password updated. All sessions revoked.");
    } catch (err) {
      setCredError(formatApiError(err));
    }
  }

  async function handleRevokeSession(id: number, isCurrent: boolean) {
    const msg = isCurrent
      ? "Revoke your current session? You will be logged out."
      : "Force logout this device?";
    if (!window.confirm(msg)) return;
    setActionError(null);
    try {
      const result = await revokeSession.mutateAsync(id);
      setActionMessage(result.message || "Session revoked.");
    } catch (err) {
      setActionError(formatApiError(err));
    }
  }

  async function handleRevokeAllForAdmin(admin: Admin) {
    if (
      !window.confirm(
        `Revoke all sessions for ${admin.username}? Their current devices will be logged out.`,
      )
    ) {
      return;
    }
    setActionError(null);
    try {
      const result = await revokeAllForAdmin.mutateAsync(admin.id);
      setActionMessage(
        `${result.message}${typeof result.revoked === "number" ? ` (${result.revoked})` : ""}`,
      );
    } catch (err) {
      setActionError(formatApiError(err));
    }
  }

  async function handleRevokeMyOthers() {
    if (!window.confirm("Revoke all of your other devices? Current session stays.")) {
      return;
    }
    setActionError(null);
    try {
      const result = await revokeMyOthers.mutateAsync();
      setActionMessage(
        `${result.message}${typeof result.revoked === "number" ? ` (${result.revoked})` : ""}`,
      );
    } catch (err) {
      setActionError(formatApiError(err));
    }
  }

  return (
    <RequireAuth superAdminOnly guestAllowed={false}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
        <div>
          <Link
            href="/command-center"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
          >
            ← Back to Command Center
          </Link>
          <h1 className="mt-4 text-3xl font-light tracking-wide text-foreground">
            Manage admins / Sessions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Superadmin only. Create admins, reset credentials, and revoke
            devices across all Admin logins.
          </p>
        </div>

        {actionError ? (
          <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        ) : null}
        {actionMessage ? (
          <p className="rounded-sm border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground">
            {actionMessage}
          </p>
        ) : null}

        <section className="border border-border bg-surface p-6">
          <h2 className="text-lg font-light text-foreground">Create admin</h2>
          {formError ? (
            <p className="mt-3 text-sm text-danger">{formError}</p>
          ) : null}
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <InputDefault
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputDefault
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="sm:col-span-2">
              <ButtonDefault type="submit" disabled={createAdmin.isPending}>
                {createAdmin.isPending ? "Creating…" : "Create admin"}
              </ButtonDefault>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-light text-foreground">Admins</h2>
          {isLoading ? (
            <EyeLoadingDefault size="md" label="Loading admins" />
          ) : isError ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : "Failed to load admins"}
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    {["Username", "Role", "Created", "Actions"].map((header) => (
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
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {admin.username}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {admin.role.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatWhen(admin.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ButtonDefault
                            type="button"
                            size="sm"
                            variant="warning"
                            onClick={() => {
                              setEditAdmin(admin);
                              setEditUsername(admin.username);
                              setCredError(null);
                            }}
                          >
                            Username
                          </ButtonDefault>
                          <ButtonDefault
                            type="button"
                            size="sm"
                            variant="warning"
                            onClick={() => {
                              setPasswordAdmin(admin);
                              setNewPassword("");
                              setConfirmPassword("");
                              setCredError(null);
                            }}
                          >
                            Password
                          </ButtonDefault>
                          <ButtonDefault
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={revokeAllForAdmin.isPending}
                            onClick={() => void handleRevokeAllForAdmin(admin)}
                          >
                            Revoke sessions
                          </ButtonDefault>
                          {admin.role === "super_admin" ? (
                            <span className="self-center text-xs text-muted">
                              Protected
                            </span>
                          ) : (
                            <ButtonDefault
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={deletingId === admin.id}
                              onClick={() => void handleDelete(admin.id)}
                            >
                              Delete
                            </ButtonDefault>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-light text-foreground">
                Sessions / devices
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every Admin login across devices. Multi-device is allowed.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <SelectDefault
                label="Filter admin"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                wrapperClassName="min-w-48"
                options={[
                  { value: "", label: "All admins" },
                  ...admins.map((admin) => ({
                    value: String(admin.id),
                    label: admin.username,
                  })),
                ]}
              />
              <ButtonDefault
                type="button"
                size="sm"
                variant="outline"
                disabled={revokeMyOthers.isPending}
                onClick={() => void handleRevokeMyOthers()}
              >
                {revokeMyOthers.isPending
                  ? "Revoking…"
                  : "Revoke my other devices"}
              </ButtonDefault>
            </div>
          </div>

          {sessionsLoading ? (
            <EyeLoadingDefault size="md" label="Loading sessions" />
          ) : sessionsError ? (
            <p className="text-sm text-danger">
              {sessionsErr instanceof Error
                ? sessionsErr.message
                : "Failed to load sessions"}
            </p>
          ) : sessions.length === 0 ? (
            <p className="border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
              No active sessions for this filter.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    {[
                      "Device",
                      "Admin",
                      "IP",
                      "Last used",
                      "Created",
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
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground">
                            {session.device_label || "Unknown device"}
                          </span>
                          {session.is_current ? (
                            <span className="rounded-sm border border-border-strong bg-accent-dim px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-foreground">
                              Current
                            </span>
                          ) : null}
                        </div>
                        {session.user_agent ? (
                          <p className="mt-1 max-w-xs truncate text-[11px] text-muted">
                            {session.user_agent}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">
                          {session.admin_username ?? "—"}
                        </span>
                        {session.admin_role ? (
                          <span className="mt-0.5 block text-[11px] capitalize text-muted">
                            {session.admin_role.replace("_", " ")}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {session.ip ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatWhen(session.last_used_at)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatWhen(session.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <ButtonDefault
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={revokeSession.isPending}
                          onClick={() =>
                            void handleRevokeSession(
                              session.id,
                              session.is_current,
                            )
                          }
                        >
                          Revoke
                        </ButtonDefault>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ModalDefault
        open={Boolean(editAdmin)}
        title="Change username"
        description={
          editAdmin
            ? `Rename ${editAdmin.username}. Superadmins may rename any admin.`
            : undefined
        }
        onClose={() => setEditAdmin(null)}
      >
        <form
          onSubmit={(event) => void handleSaveUsername(event)}
          className="space-y-4"
        >
          {credError ? (
            <p className="text-sm text-danger">{credError}</p>
          ) : null}
          <InputDefault
            label="New username"
            required
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <ButtonDefault
              type="button"
              variant="ghost"
              onClick={() => setEditAdmin(null)}
            >
              Cancel
            </ButtonDefault>
            <ButtonDefault
              type="submit"
              disabled={updateUsername.isPending || !editUsername.trim()}
            >
              {updateUsername.isPending ? "Saving…" : "Save username"}
            </ButtonDefault>
          </div>
        </form>
      </ModalDefault>

      <ModalDefault
        open={Boolean(passwordAdmin)}
        title="Reset password"
        description={
          passwordAdmin
            ? `Set a new password for ${passwordAdmin.username}. All of their sessions will be revoked.`
            : undefined
        }
        onClose={() => setPasswordAdmin(null)}
      >
        <form
          onSubmit={(event) => void handleSavePassword(event)}
          className="space-y-4"
        >
          {credError ? (
            <p className="text-sm text-danger">{credError}</p>
          ) : null}
          <InputDefault
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <InputDefault
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <ButtonDefault
              type="button"
              variant="ghost"
              onClick={() => setPasswordAdmin(null)}
            >
              Cancel
            </ButtonDefault>
            <ButtonDefault
              type="submit"
              disabled={
                updatePassword.isPending ||
                !newPassword ||
                !confirmPassword
              }
            >
              {updatePassword.isPending ? "Saving…" : "Update password"}
            </ButtonDefault>
          </div>
        </form>
      </ModalDefault>
    </RequireAuth>
  );
}
