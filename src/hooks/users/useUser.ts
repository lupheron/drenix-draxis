"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isApiConfigured } from "@/lib/api/client";
import {
  createUser,
  createUserCharge,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  type UsersListParams,
} from "@/lib/api/users";
import { userKeys } from "@/hooks/users/query-keys";
import type {
  CreateChargePayload,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "@/types/staff";

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    enabled: isApiConfigured(),
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
    queryFn: () => getUser(userId!),
    enabled: isApiConfigured() && Boolean(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateEmployeePayload;
    }) => updateUser(userId, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useCreateUserCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: CreateChargePayload;
    }) => createUserCharge(userId, payload),
    onSuccess: (_charge, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
