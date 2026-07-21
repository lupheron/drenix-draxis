"use client";

import { useRouter } from "next/navigation";
import EmployeeForm from "@/components/Portal/EmployeeForm";
import RequireAuth from "@/components/Portal/RequireAuth";
import { useCreateUser } from "@/hooks/useCreateUser";
import type { EmployeePayload } from "@/lib/types";

export default function NewEmployeePage() {
  const router = useRouter();
  const createUser = useCreateUser();

  async function handleCreate(payload: EmployeePayload) {
    await createUser.mutateAsync(payload);
    router.push("/employees");
  }

  return (
    <RequireAuth adminOnly guestAllowed={false}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
            Staff
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-wide text-foreground">
            Add employee
          </h1>
        </div>

        <EmployeeForm
          submitLabel="Create employee"
          onCancel={() => router.push("/employees")}
          onSubmit={handleCreate}
        />
      </div>
    </RequireAuth>
  );
}
