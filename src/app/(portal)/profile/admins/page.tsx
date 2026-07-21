"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useAdmins } from "@/hooks/useAdmins";
import { useCreateAdmin } from "@/hooks/useCreateAdmin";
import { useDeleteAdmin } from "@/hooks/useDeleteAdmin";
import { formatApiError } from "@/utils/portal-errors";

export default function ProfileAdminsPage() {
  const { data, isLoading, isError, error } = useAdmins();
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    } catch (deleteError) {
      setActionError(formatApiError(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  const admins = data?.data ?? [];

  return (
    <RequireAuth superAdminOnly guestAllowed={false}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            href="/command-center"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
          >
            ← Back to employees
          </Link>
          <h1 className="mt-4 text-3xl font-light tracking-wide text-foreground">
            Manage admins
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and remove admin accounts. Super admins cannot be deleted.
          </p>
        </div>

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
                {createAdmin.isPending ? "Creating..." : "Create admin"}
              </ButtonDefault>
            </div>
          </form>
        </section>

        {actionError ? (
          <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        ) : null}

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
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {admin.role === "super_admin" ? (
                        <span className="text-xs text-muted">Protected</span>
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
