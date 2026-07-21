"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageHeaderDefault from "@/components/UI/PageHeaderDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import EmployeeProfileModalDefault from "@/components/CommandCenter/EmployeeProfileModalDefault";
import { COMPANIES, getCompanyLabel } from "@/constants/companies";
import { getDepartmentLabel } from "@/constants/departments";
import { useEmployees } from "@/hooks/useEmployees";
import type { CompanyCode, Employee } from "@/lib/types";
import RequireAuth from "@/components/Portal/RequireAuth";

export default function CompanyControlView() {
  const [activeCompany, setActiveCompany] = useState<CompanyCode>("JM");
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);
  const { data: employees = [], isLoading } = useEmployees();

  const companyEmployees = useMemo(
    () => employees.filter((employee) => employee.company === activeCompany),
    [employees, activeCompany],
  );

  const byDepartment = useMemo(() => {
    const groups = new Map<string, Employee[]>();
    for (const employee of companyEmployees) {
      const key = employee.department;
      groups.set(key, [...(groups.get(key) ?? []), employee]);
    }
    return groups;
  }, [companyEmployees]);

  return (
    <RequireAuth adminOnly guestAllowed={false}>
      <PageHeaderDefault
        title="Company Control"
        description="Employee counts and department breakdown by company."
      />

      <div className="space-y-6 px-8 py-8">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {COMPANIES.map((company) => (
            <button
              key={company.code}
              type="button"
              onClick={() => setActiveCompany(company.code)}
              className={
                activeCompany === company.code
                  ? "border border-border-strong bg-accent-dim px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground"
                  : "border border-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
              }
            >
              {company.code}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCardDefault
            id="total"
            label="Total employees"
            value={isLoading ? "..." : String(companyEmployees.length)}
            change={getCompanyLabel(activeCompany)}
          />
          <StatCardDefault
            id="hr"
            label="Human Resources"
            value={String(byDepartment.get("hr")?.length ?? 0)}
          />
          <StatCardDefault
            id="safety"
            label="Safety"
            value={String(byDepartment.get("safety")?.length ?? 0)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/command-center?company=${activeCompany}`}
            className="text-sm text-foreground underline"
          >
            View in Command Center
          </Link>
          <Link
            href={`/human-resources/${activeCompany.toLowerCase()}`}
            className="text-sm text-foreground underline"
          >
            HR analytics ({activeCompany})
          </Link>
        </div>

        <div className="border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium text-foreground">
              {getCompanyLabel(activeCompany)} — employees
            </h2>
            <p className="mt-3 border border-border-strong bg-accent-dim px-3 py-2 text-xs text-foreground">
              Tip: click a person&apos;s{" "}
              <span className="font-medium underline">name</span> to open their
              details.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {["Name · click", "Department", "Position", "Phone", "Email"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {companyEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted"
                    >
                      No employees for this company yet.
                    </td>
                  </tr>
                ) : (
                  companyEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setProfileEmployee(employee)}
                          title="Click to open employee details"
                          className="group inline-flex items-center gap-1.5 text-left text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          <span>
                            {employee.first_name} {employee.last_name}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.12em] text-muted opacity-70 group-hover:opacity-100">
                            details
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getDepartmentLabel(employee.department)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {employee.position ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {employee.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {employee.email ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmployeeProfileModalDefault
        open={Boolean(profileEmployee)}
        employee={profileEmployee}
        onClose={() => setProfileEmployee(null)}
      />
    </RequireAuth>
  );
}
