import { useQuery } from "@tanstack/react-query";
import {
  browseDriverLeads,
  searchDriverLeads,
  type DriverLeadSearchParams,
  type DriverLeadsBrowseParams,
} from "@/lib/api/driver-leads";
import { queryKeys } from "@/hooks/query-keys";

export function useDriverLeadSearch(
  params: DriverLeadSearchParams | null,
  enabled: boolean,
) {
  const hasField = Boolean(
    params?.name?.trim() || params?.phone?.trim() || params?.email?.trim(),
  );

  return useQuery({
    queryKey: queryKeys.driverLeadsSearch(params?.company ?? "JM", params),
    queryFn: () => searchDriverLeads(params!),
    enabled: enabled && Boolean(params) && hasField,
  });
}

export function useDriverLeadsBrowse(params: DriverLeadsBrowseParams) {
  return useQuery({
    queryKey: queryKeys.driverLeadsBrowse({
      company: params.company,
      status: params.status,
      board: params.board,
      page: params.page,
      per_page: params.per_page,
    }),
    queryFn: () => browseDriverLeads(params),
  });
}
