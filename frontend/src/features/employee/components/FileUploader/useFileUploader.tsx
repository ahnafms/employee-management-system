import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";
import {
  useReadUploadProgress,
  useSetUploadProgress,
} from "@/store/notifications";
import {
  UploadEmployeeCSV,
  type UploadResponse,
} from "../../api/upload-employee-csv";

interface UploadEmployeeCSVProps {
  onSuccess?: () => void;
}

export function useFileUploader({ onSuccess }: UploadEmployeeCSVProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const uploadProgress = useReadUploadProgress();
  const setUploadProgress = useSetUploadProgress();

  useEffect(() => {
    if (
      uploadProgress?.status === "COMPLETED" ||
      uploadProgress?.status === "FAILED"
    ) {
      const timer = setTimeout(() => {
        setOpen(false);
        setFile(null);
        setUploadResult(null);
        setUploadProgress(null);
        onSuccess?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress?.status, setUploadProgress, onSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".csv") &&
        selectedFile.type !== "text/csv"
      ) {
        setError("Please select a valid CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadResult(null);
      setUploadProgress(null);

      const formData = new FormData();
      formData.append("file", file);

      const result = await UploadEmployeeCSV(formData);

      setUploadResult(result);

      queryClient.invalidateQueries({
        queryKey: ["employees"],
        exact: false,
      });
    } catch (err) {
      const errorMessage = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : "Failed to upload file";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFile(null);
      setError(null);
      setUploadResult(null);
      setUploadProgress(null);
    }
    setOpen(newOpen);
  };

  return {
    open,
    setOpen,
    handleFileChange,
    handleOpenChange,
    handleUpload,
    loading,
    uploadResult,
    error,
    uploadProgress,
    file,
  };
}
