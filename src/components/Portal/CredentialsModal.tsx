"use client";

import { useState } from "react";
import ModalDefault from "@/components/UI/ModalDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import type { ApproveCredentials } from "@/lib/types";

type CredentialsModalProps = {
  open: boolean;
  credentials: ApproveCredentials | null;
  onClose: () => void;
};

export default function CredentialsModal({
  open,
  credentials,
  onClose,
}: CredentialsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copyValue(field: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  if (!credentials) return null;

  return (
    <ModalDefault
      open={open}
      title="Access credentials"
      description="Share these credentials with the requester in person. The password cannot be retrieved later."
      onClose={onClose}
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="rounded-sm border border-border bg-surface-elevated p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Username
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <code className="text-sm text-foreground">{credentials.username}</code>
            <ButtonDefault
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyValue("username", credentials.username)}
            >
              {copiedField === "username" ? "Copied" : "Copy"}
            </ButtonDefault>
          </div>
        </div>

        <div className="rounded-sm border border-warning/40 bg-warning/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-warning">
            Password (shown once)
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <code className="text-sm text-foreground">{credentials.password}</code>
            <ButtonDefault
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyValue("password", credentials.password)}
            >
              {copiedField === "password" ? "Copied" : "Copy"}
            </ButtonDefault>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Expires:{" "}
          <span className="text-foreground">
            {new Date(credentials.expires_at).toLocaleString()}
          </span>
        </p>

        <ButtonDefault type="button" className="w-full" onClick={onClose}>
          I have shared the credentials
        </ButtonDefault>
      </div>
    </ModalDefault>
  );
}
