"use client";

import { useMemo, useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import { hrChartColors } from "@/components/HrCompanyDashboard/SectionNav";
import { COMPANY_CODES, getCompanyLabel } from "@/constants/companies";
import {
  useDriverLeadSearch,
  useDriverLeadsBrowse,
} from "@/hooks/useDriverLeads";
import type {
  CompanyCode,
  DriverLeadRecord,
  DriverLeadSearchGroup,
  DriverLeadStatusKey,
} from "@/lib/types";
import { formatApiError } from "@/utils/portal-errors";

const STATUS_OPTIONS: { value: DriverLeadStatusKey | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "rejected", label: "Rejected" },
  { value: "n_a", label: "N/A" },
  { value: "follow_up", label: "Follow up" },
  { value: "call_back", label: "Call back" },
  { value: "hired", label: "Hired" },
  { value: "not_valid", label: "Not valid" },
  { value: "company_driver", label: "Company driver" },
  { value: "lease_driver", label: "Lease driver" },
];

const STATUS_COLORS: Record<string, string> = {
  rejected: hrChartColors.rejected,
  n_a: hrChartColors.muted,
  follow_up: hrChartColors.followUp,
  call_back: hrChartColors.voicemail,
  hired: hrChartColors.hired,
  not_valid: hrChartColors.other,
  company_driver: hrChartColors.leads,
  lease_driver: hrChartColors.inbound,
};

type DriverDatabaseSectionProps = {
  company: CompanyCode;
  /** When false, company selector is shown (standalone page). */
  lockCompany?: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function StatusBadge({ statusKey, label }: { statusKey: string; label: string }) {
  const color = STATUS_COLORS[statusKey] ?? hrChartColors.other;
  return (
    <span
      className="inline-flex rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
      style={{
        borderColor: `${color}66`,
        backgroundColor: `${color}22`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function HistoryCard({ record }: { record: DriverLeadRecord }) {
  const columnEntries = Object.entries(record.columns ?? {}).filter(
    ([, value]) => value?.trim(),
  );

  return (
    <article className="border border-border bg-surface-elevated p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{record.board_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {record.group_title} · {record.status}
          </p>
        </div>
        <StatusBadge statusKey={record.status_key} label={record.status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Name" value={record.name} />
        <DetailField label="Phone" value={record.phone} />
        <DetailField label="Email" value={record.email} />
        <DetailField label="Recruiter" value={record.recruiter} />
        <DetailField label="State" value={record.state} />
        <DetailField label="Platform" value={record.platform} />
        <DetailField label="Position" value={record.position} />
        <DetailField label="Applied" value={formatDate(record.applied_on)} />
        <DetailField label="Contacted" value={formatDate(record.contacted_on)} />
      </div>

      {record.notes?.trim() ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {record.notes}
          </p>
        </div>
      ) : null}

      {columnEntries.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Monday columns
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {columnEntries.map(([key, value]) => (
              <div key={key}>
                <dt className="text-[10px] uppercase tracking-[0.15em] text-muted">
                  {key}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </article>
  );
}

function SearchResultGroup({ group }: { group: DriverLeadSearchGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent-dim/30"
      >
        <div>
          <p className="text-lg font-light text-foreground">{group.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {[group.phone, group.email].filter(Boolean).join(" · ") || "No contact"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">
              {group.application_count} application
              {group.application_count === 1 ? "" : "s"}
            </span>
            {group.statuses.map((status) => (
              <StatusBadge
                key={status}
                statusKey={status}
                label={status.replace(/_/g, " ")}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border px-5 py-4">
          {group.history.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function BrowseRow({ record }: { record: DriverLeadRecord }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-accent-dim/20">
      <td className="px-4 py-3 text-foreground">{record.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{record.phone ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{record.email ?? "—"}</td>
      <td className="px-4 py-3">
        <StatusBadge statusKey={record.status_key} label={record.status} />
      </td>
      <td className="px-4 py-3 text-muted-foreground">{record.board_name}</td>
      <td className="px-4 py-3 text-muted-foreground">{record.recruiter ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{record.state ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(record.applied_on)}
      </td>
    </tr>
  );
}

export default function DriverDatabaseSection({
  company: initialCompany,
  lockCompany = false,
}: DriverDatabaseSectionProps) {
  const [company, setCompany] = useState<CompanyCode>(initialCompany);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState<{
    name: string;
    phone: string;
    email: string;
  } | null>(null);

  const [browseStatus, setBrowseStatus] = useState<DriverLeadStatusKey | "">("");
  const [browseBoard, setBrowseBoard] = useState("");
  const [browsePage, setBrowsePage] = useState(1);

  const searchParams = useMemo(
    () =>
      searchSubmitted
        ? {
            company,
            name: searchSubmitted.name,
            phone: searchSubmitted.phone,
            email: searchSubmitted.email,
          }
        : null,
    [company, searchSubmitted],
  );

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
    error: searchErr,
  } = useDriverLeadSearch(searchParams, Boolean(searchSubmitted));

  const {
    data: browseData,
    isLoading: browseLoading,
    isError: browseError,
    error: browseErr,
  } = useDriverLeadsBrowse({
    company,
    status: browseStatus,
    board: browseBoard,
    page: browsePage,
    per_page: 50,
  });

  const browseRows = browseData?.data ?? [];
  const browseMeta = browseData?.meta;

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const name = searchName.trim();
    const phone = searchPhone.trim();
    const email = searchEmail.trim();
    if (!name && !phone && !email) return;
    setSearchSubmitted({ name, phone, email });
  }

  function clearSearch() {
    setSearchName("");
    setSearchPhone("");
    setSearchEmail("");
    setSearchSubmitted(null);
  }

  return (
    <div className="space-y-8">
      <section className="border border-border bg-surface p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-light text-foreground">Search leads</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Match by name, phone, and/or email. Fill one or more fields.
            </p>
          </div>
          {!lockCompany ? (
            <SelectDefault
              label="Company"
              value={company}
              onChange={(event) => {
                setCompany(event.target.value as CompanyCode);
                setBrowsePage(1);
                setSearchSubmitted(null);
              }}
              wrapperClassName="min-w-40"
              options={COMPANY_CODES.map((code) => ({
                value: code,
                label: `${code} — ${getCompanyLabel(code)}`,
              }))}
            />
          ) : null}
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InputDefault
            label="Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Jesus Quintana"
          />
          <InputDefault
            label="Phone"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="+1..."
          />
          <InputDefault
            label="Email"
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <ButtonDefault type="submit" className="flex-1">
              Search
            </ButtonDefault>
            {searchSubmitted ? (
              <ButtonDefault type="button" variant="ghost" onClick={clearSearch}>
                Clear
              </ButtonDefault>
            ) : null}
          </div>
        </form>

        <div className="mt-6">
          {!searchSubmitted ? (
            <p className="text-sm text-muted-foreground">
              Enter at least one field and search to see full Monday history.
            </p>
          ) : searchLoading || searchFetching ? (
            <EyeLoadingDefault size="md" label="Searching driver leads" />
          ) : searchError ? (
            <p className="text-sm text-danger">{formatApiError(searchErr)}</p>
          ) : searchData?.found === false ? (
            <p className="rounded-sm border border-border bg-surface-elevated px-4 py-6 text-center text-sm text-muted-foreground">
              {searchData.message ?? "Nothing found"}
            </p>
          ) : (
            <div className="space-y-4">
              {(searchData?.data ?? []).map((group) => (
                <SearchResultGroup
                  key={`${group.name}-${group.phone ?? ""}-${group.email ?? ""}`}
                  group={group}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 border border-border bg-surface p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-light text-foreground">Browse database</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter synced Monday leads from the database — no live Monday calls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SelectDefault
              label="Status"
              value={browseStatus}
              onChange={(event) => {
                setBrowseStatus(event.target.value as DriverLeadStatusKey | "");
                setBrowsePage(1);
              }}
              wrapperClassName="min-w-44"
              options={STATUS_OPTIONS}
            />
            <InputDefault
              label="Board"
              value={browseBoard}
              onChange={(e) => {
                setBrowseBoard(e.target.value);
                setBrowsePage(1);
              }}
              placeholder="Optional board filter"
              wrapperClassName="min-w-48"
            />
          </div>
        </div>

        {browseLoading ? (
          <EyeLoadingDefault size="md" label="Loading leads" />
        ) : browseError ? (
          <p className="text-sm text-danger">{formatApiError(browseErr)}</p>
        ) : browseRows.length === 0 ? (
          <p className="border border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            No leads for this filter.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    {[
                      "Name",
                      "Phone",
                      "Email",
                      "Status",
                      "Board",
                      "Recruiter",
                      "State",
                      "Applied",
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
                  {browseRows.map((record) => (
                    <BrowseRow key={record.id} record={record} />
                  ))}
                </tbody>
              </table>
            </div>

            {browseMeta && browseMeta.last_page > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {browseMeta.page} of {browseMeta.last_page} ·{" "}
                  {browseMeta.total.toLocaleString()} total
                </p>
                <div className="flex gap-2">
                  <ButtonDefault
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={browsePage <= 1}
                    onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </ButtonDefault>
                  <ButtonDefault
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={browsePage >= browseMeta.last_page}
                    onClick={() =>
                      setBrowsePage((p) => Math.min(browseMeta.last_page, p + 1))
                    }
                  >
                    Next
                  </ButtonDefault>
                </div>
              </div>
            ) : browseMeta ? (
              <p className="text-sm text-muted-foreground">
                {browseMeta.total.toLocaleString()} lead
                {browseMeta.total === 1 ? "" : "s"}
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
