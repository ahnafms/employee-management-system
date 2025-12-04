import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/features/auth/api/login";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface FormLoginProps {
  onSuccess?: () => void;
}

export function useFormLogin({ onSuccess }: FormLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await login(data);

      if (response.success) {
        onSuccess?.();
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    register,
    handleSubmit,
    errors,
    onSubmit,
  };
}
