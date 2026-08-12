import { apiRequest } from "@/lib/api/client";
import type {
  CompanyCode,
  DriverLeadSearchResponse,
  DriverLeadsBrowseResponse,
  DriverLeadStatusKey,
} from "@/lib/types";

export type DriverLeadSearchParams = {
  company: CompanyCode;
  name?: string;
  phone?: string;
  email?: string;
};

export type DriverLeadsBrowseParams = {
  company: CompanyCode;
  status?: DriverLeadStatusKey | "";
  board?: string;
  page?: number;
  per_page?: number;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function searchDriverLeads(
  params: DriverLeadSearchParams,
): Promise<DriverLeadSearchResponse> {
  return apiRequest<DriverLeadSearchResponse>(
    `/driver-leads/search${buildQuery({
      company: params.company,
      name: params.name?.trim(),
      phone: params.phone?.trim(),
      email: params.email?.trim(),
    })}`,
  );
}

export async function browseDriverLeads(
  params: DriverLeadsBrowseParams,
): Promise<DriverLeadsBrowseResponse> {
  return apiRequest<DriverLeadsBrowseResponse>(
    `/driver-leads${buildQuery({
      company: params.company,
      status: params.status,
      board: params.board?.trim(),
      page: params.page ?? 1,
      per_page: params.per_page ?? 50,
    })}`,
  );
}
