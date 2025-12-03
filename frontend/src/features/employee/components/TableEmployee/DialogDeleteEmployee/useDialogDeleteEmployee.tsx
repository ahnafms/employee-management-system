import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteEmployee } from "@/features/employee/api/delete-employee";
import type { Employee } from "@/features/employee/dto/employee";
import { ApiError, type ApiError as IApiError } from "@/types/api";

export function useDialogDeleteEmployee() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = useCallback((employee: Employee) => {
    setDeletingEmployee(employee);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setDeletingEmployee(null);
  }, []);

  const handleSubmit = useCallback(async (): Promise<{
    success: boolean;
    message: string;
    error?: IApiError;
  }> => {
    if (!deletingEmployee) {
      const error = new ApiError(400, "No employee selected");
      return {
        success: false,
        message: "No employee selected",
        error,
      };
    }

    try {
      setIsLoading(true);
      await deleteEmployee(deletingEmployee.id);
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        exact: false,
      });

      closeDialog();
      return {
        success: true,
        message: "Employee deleted successfully",
      };
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.message || "Failed to delete employee";
      console.error(err);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    } finally {
      setIsLoading(false);
    }
  }, [deletingEmployee, queryClient, closeDialog]);

  return {
    open,
    deletingEmployee,
    isLoading,
    openDialog,
    closeDialog,
    handleSubmit,
  };
}
