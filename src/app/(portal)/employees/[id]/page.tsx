"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import ButtonDefault from "@/components/Button/ButtonDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import EmployeeForm from "@/components/Portal/EmployeeForm";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUser } from "@/hooks/useUsers";
import { authStorage } from "@/lib/auth-storage";
import type { EmployeePayload } from "@/lib/types";
import { formatApiError } from "@/utils/portal-errors";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const employeeId = Number(id);
  const canManage = authStorage.canManageEmployees();
  const showSalary = authStorage.canSeeSalary();

  const { data, isLoading, isError, error } = useUser(id);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const employee = data?.data;

  async function handleUpdate(payload: EmployeePayload) {
    await updateUser.mutateAsync({ id: employeeId, body: payload });
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this employee permanently?")) return;

    setDeleteError(null);
    try {
      await deleteUser.mutateAsync(employeeId);
      router.push("/employees");
    } catch (deleteErr) {
      setDeleteError(formatApiError(deleteErr));
    }
  }

  if (isLoading) {
    return <EyeLoadingDefault fullPage size="lg" label="Loading employee" />;
  }

  if (isError || !employee) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : "Employee not found"}
      </p>
    );
  }

  if (editing && canManage) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
            Staff
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-wide text-foreground">
            Edit employee
          </h1>
        </div>

        <EmployeeForm
          initial={employee}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
            Staff
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-wide text-foreground">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {employee.department} · {employee.company ?? "No company"}
          </p>
        </div>

        {canManage ? (
          <div className="flex gap-2">
            <ButtonDefault
              type="button"
              variant="warning"
              onClick={() => setEditing(true)}
            >
              Edit
            </ButtonDefault>
            <ButtonDefault
              type="button"
              variant="danger"
              disabled={deleteUser.isPending}
              onClick={() => void handleDelete()}
            >
              Delete
            </ButtonDefault>
          </div>
        ) : null}
      </div>

      {deleteError ? (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {deleteError}
        </p>
      ) : null}

      <section className="grid gap-6 border border-border bg-surface p-6 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="First name" value={employee.first_name} />
        <DetailField label="Last name" value={employee.last_name} />
        <DetailField
          label="Birth date"
          value={employee.birth_date.slice(0, 10)}
        />
        <DetailField
          label="Joined at"
          value={employee.joined_at.slice(0, 10)}
        />
        <DetailField label="Shift" value={employee.shift} />
        {showSalary ? (
          <DetailField
            label="Salary"
            value={
              employee.salary !== undefined
                ? Number(employee.salary).toLocaleString()
                : undefined
            }
          />
        ) : null}
        <DetailField label="Grade" value={employee.grade} />
        <DetailField label="Status" value={employee.status} />
        <DetailField label="Department" value={employee.department} />
        <DetailField label="Position" value={employee.position} />
        <DetailField label="Company" value={employee.company} />
        <DetailField label="Phone" value={employee.phone} />
        <DetailField label="Email" value={employee.email} />
        <DetailField label="Gender" value={employee.gender} />
        <DetailField label="Address" value={employee.address} />
        <DetailField label="City" value={employee.city} />
        <DetailField label="State" value={employee.state} />
        <DetailField label="Country" value={employee.country} />
      </section>

      <ButtonDefault href="/employees" variant="ghost">
        Back to employees
      </ButtonDefault>
    </div>
  );
}
