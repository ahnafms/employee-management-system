import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEmployee } from "@/features/employee/api/create-employee";
import { useQueryClient } from "@tanstack/react-query";

const employeeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "Age must be at least 18")
    .max(120, "Age must be less than 120"),
  position: z
    .string()
    .min(1, "Position is required")
    .min(2, "Position must be at least 2 characters"),
  salary: z
    .number()
    .positive("Salary must be a positive number")
    .finite("Salary must be a valid number"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface FormCreateEmployeeProps {
  onSuccess?: () => void;
}

export function useFormCreateEmployee({ onSuccess }: FormCreateEmployeeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      await createEmployee(data);

      setSubmitMessage({
        type: "success",
        message: "Employee created successfully!",
      });
      reset();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          queryClient.invalidateQueries({
            queryKey: ["employees"],
            exact: false,
          });
        }, 1000);
      }

      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create employee",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    isSubmitting,
    submitMessage,
    errors,
  };
}
