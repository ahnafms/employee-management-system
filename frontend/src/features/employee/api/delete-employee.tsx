import { apiClient } from '@/lib/api';

export async function deleteEmployee(id: string) {
  return apiClient(`/employees/${encodeURIComponent(id)}`, 'DELETE');
}
