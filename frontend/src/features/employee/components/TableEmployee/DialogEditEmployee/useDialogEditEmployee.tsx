import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateEmployee } from "@/features/employee/api/update-employee";
import type { Employee } from "@/features/employee/dto/employee";
import { ApiError, type ApiError as IApiError } from "@/types/api";

interface EditForm {
  name: string;
  age: string;
  position: string;
  salary: string;
}

export function useDialogEditEmployee() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    age: "",
    position: "",
    salary: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      age: String(employee.age),
      position: employee.position,
      salary: String(employee.salary),
    });
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditingEmployee(null);
  }, []);

  const updateForm = useCallback((updates: Partial<EditForm>) => {
    setEditForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(async (): Promise<{
    success: boolean;
    message: string;
    error?: IApiError;
  }> => {
    if (!editingEmployee) {
      const error = new ApiError(400, "No employee selected");
      return {
        success: false,
        message: "No employee selected",
        error,
      };
    }

    try {
      setIsLoading(true);

      const payload: Record<string, string | number> = {};
      if (editForm.name !== editingEmployee.name) payload.name = editForm.name;

      const ageNum = parseInt(editForm.age, 10);
      if (!Number.isNaN(ageNum) && ageNum !== editingEmployee.age)
        payload.age = ageNum;

      if (editForm.position !== editingEmployee.position)
        payload.position = editForm.position;

      const salaryNum = parseFloat(editForm.salary);
      if (
        !Number.isNaN(salaryNum) &&
        salaryNum !== Number(editingEmployee.salary)
      )
        payload.salary = salaryNum;

      if (Object.keys(payload).length === 0) {
        closeDialog();
        return {
          success: true,
          message: "No changes made",
        };
      }

      await updateEmployee(editingEmployee.id, payload);
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        exact: false,
      });

      closeDialog();
      return {
        success: true,
        message: "Employee updated successfully",
      };
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.message || "Failed to update employee";
      console.error(err);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    } finally {
      setIsLoading(false);
    }
  }, [editingEmployee, editForm, queryClient, closeDialog]);

  return {
    open,
    editingEmployee,
    editForm,
    isLoading,
    openDialog,
    closeDialog,
    updateForm,
    handleSubmit,
  };
}
