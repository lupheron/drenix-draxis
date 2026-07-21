import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AccessRequest } from "@/lib/types";

type CreateAccessRequestInput = {
  access_profile_id: number;
  requester_name: string;
  reason: string;
};

export function useCreateAccessRequest() {
  return useMutation({
    mutationFn: (body: CreateAccessRequestInput) =>
      api<{ data: AccessRequest; message: string }>("/access-requests", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}
