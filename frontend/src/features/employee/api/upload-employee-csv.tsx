import { apiClient } from "@/lib/api";

export interface UploadResponse {
  success: boolean;
  message: string;
  importedCount?: number;
  failedCount?: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
}

export async function UploadEmployeeCSV(
  data: FormData
): Promise<UploadResponse> {
  return await apiClient("/employees/upload-csv", "POST", data, {
    isFormData: true,
  });
}
