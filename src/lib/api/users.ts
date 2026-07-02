import { apiRequest } from "@/lib/api/client";
import {
  laravelChargeToEmployeeCharge,
  laravelUserToEmployee,
  userPayloadToLaravel,
} from "@/lib/api/mappers";
import type {
  CreateChargePayload,
  CreateEmployeePayload,
  Employee,
  EmployeeCharge,
  UpdateEmployeePayload,
} from "@/types/staff";

export type UsersListParams = {
  departmentId?: string;
  from?: string;
  to?: string;
};

type UsersResponse = {
  data: Parameters<typeof laravelUserToEmployee>[0][];
};

type UserResponse = {
  data: Parameters<typeof laravelUserToEmployee>[0];
};

type ChargeResponse = {
  data: {
    id: number | string;
    user_id?: number | string;
    employee_id?: number | string;
    date: string;
    amount: number | string;
    description?: string | null;
  };
};

export async function getUsers(params?: UsersListParams): Promise<Employee[]> {
  const searchParams = new URLSearchParams();

  if (params?.departmentId && params.departmentId !== "all") {
    searchParams.set("department", params.departmentId);
  }
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  const response = await apiRequest<UsersResponse>(
    `/users${query ? `?${query}` : ""}`,
  );

  return response.data.map(laravelUserToEmployee);
}

export async function getUser(userId: string): Promise<Employee> {
  const response = await apiRequest<UserResponse>(`/users/${userId}`);
  return laravelUserToEmployee(response.data);
}

export async function createUser(
  payload: CreateEmployeePayload,
): Promise<Employee> {
  const response = await apiRequest<UserResponse>("/users", {
    method: "POST",
    body: JSON.stringify(userPayloadToLaravel(payload)),
  });

  return laravelUserToEmployee(response.data);
}

export async function updateUser(
  userId: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const response = await apiRequest<UserResponse>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userPayloadToLaravel(payload)),
  });

  return laravelUserToEmployee(response.data);
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest<void>(`/users/${userId}`, {
    method: "DELETE",
  });
}

export async function createUserCharge(
  userId: string,
  payload: CreateChargePayload,
): Promise<EmployeeCharge> {
  const response = await apiRequest<ChargeResponse>(
    `/users/${userId}/charges`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return laravelChargeToEmployeeCharge(response.data, userId);
}
