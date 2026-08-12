"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CredentialsModal from "@/components/Portal/CredentialsModal";
import EmployeeForm from "@/components/Portal/EmployeeForm";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useSetPortalCredentials } from "@/hooks/useEmployeeMutations";
import { authStorage } from "@/lib/auth-storage";
import type {
  ApproveCredentials,
  EmployeePayload,
  PortalCredentialsPayload,
} from "@/lib/types";

export default function NewEmployeePage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const portalCreds = useSetPortalCredentials();
  const [issuedPortalCreds, setIssuedPortalCreds] =
    useState<ApproveCredentials | null>(null);

  async function handleCreate(
    payload: EmployeePayload,
    portal?: PortalCredentialsPayload | null,
  ) {
    const response = await createUser.mutateAsync(payload);
    if (portal) {
      await portalCreds.mutateAsync({
        id: response.data.id,
        payload: portal,
      });
      setIssuedPortalCreds({
        username: portal.username,
        password: portal.password,
      });
      return;
    }
    router.push("/employees");
  }

  return (
    <RequireAuth guestAllowed>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
            Staff
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-wide text-foreground">
            Add employee
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create staff and optional Client Portal login (username + password).
          </p>
        </div>

        <EmployeeForm
          submitLabel="Create employee"
          onCancel={() => router.push("/employees")}
          onSubmit={handleCreate}
          defaultCompany={authStorage.getAccessProfile()?.company ?? "JM"}
        />
      </div>

      <CredentialsModal
        open={Boolean(issuedPortalCreds)}
        credentials={issuedPortalCreds}
        title="Client Portal credentials"
        description="Share these with the employee for the light Client app. The password cannot be retrieved later."
        onClose={() => {
          setIssuedPortalCreds(null);
          router.push("/employees");
        }}
      />
    </RequireAuth>
  );
}
