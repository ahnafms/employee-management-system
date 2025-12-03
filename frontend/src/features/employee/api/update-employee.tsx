import { apiClient } from '@/lib/api';

export interface UpdateEmployeeData {
  name?: string;
  age?: number;
  position?: string;
  salary?: number | string;
}

export async function updateEmployee(id: string, data: UpdateEmployeeData) {
  const payload = {
    ...data,
    salary: typeof data.salary === 'string' ? parseFloat(data.salary) : data.salary,
  };

  return apiClient(`/employees/${encodeURIComponent(id)}`, 'PATCH', payload);
}
