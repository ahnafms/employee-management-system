import { apiClient } from "@/lib/api";

export interface CreateEmployeeData {
  name: string;
  age: number;
  position: string;
  salary: number;
}

export interface EmployeeResponse extends CreateEmployeeData {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createEmployee(
  data: CreateEmployeeData
): Promise<EmployeeResponse> {
  return apiClient("/employees", "POST", data);
}
