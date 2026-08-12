"use client";

import InputDefault from "@/components/FormItems/Input/InputDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";

type ClientPortalAccessSectionProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  username: string;
  onUsernameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  /** Existing username from API (edit mode) — password is never shown. */
  existingUsername?: string | null;
  hasPortalAccess?: boolean;
  mode: "create" | "edit";
  /** Optional: reset credentials without saving the whole employee form. */
  onResetOnly?: () => void;
  resetLoading?: boolean;
};

export default function ClientPortalAccessSection({
  enabled,
  onEnabledChange,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  existingUsername,
  hasPortalAccess,
  mode,
  onResetOnly,
  resetLoading = false,
}: ClientPortalAccessSectionProps) {
  const showFields = enabled || mode === "edit";

  return (
    <section className="space-y-4 border border-border bg-surface p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
            Client Portal access
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Light employee app login. Password is write-only — never shown
            again after save.
          </p>
          {hasPortalAccess || existingUsername ? (
            <p className="mt-2 text-xs text-success">
              Portal login exists
              {existingUsername ? `: ${existingUsername}` : ""}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">No portal login yet</p>
          )}
        </div>
        {mode === "create" ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => onEnabledChange(event.target.checked)}
              className="accent-foreground"
            />
            Issue credentials
          </label>
        ) : null}
      </div>

      {showFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputDefault
            label="Portal username"
            autoComplete="off"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            hint={
              mode === "edit"
                ? "Leave as current username, or set a new one"
                : "Required with password to create portal login"
            }
            required={mode === "create" && enabled}
          />
          <InputDefault
            label={mode === "edit" ? "New portal password" : "Portal password"}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            hint={
              mode === "edit"
                ? "Fill to reset password (with username above)"
                : undefined
            }
            required={mode === "create" && enabled}
          />
        </div>
      ) : null}

      {mode === "edit" && onResetOnly ? (
        <div className="flex justify-end">
          <ButtonDefault
            type="button"
            variant="outline"
            size="sm"
            disabled={resetLoading || !password.trim() || !username.trim()}
            onClick={onResetOnly}
          >
            {resetLoading ? "Saving…" : "Reset portal password"}
          </ButtonDefault>
        </div>
      ) : null}
    </section>
  );
}
