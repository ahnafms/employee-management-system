import { useNavigate } from "@tanstack/react-router";
import { FormLogin } from "@/features/auth/components";

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: "/home/dashboard" });
  };

  return <FormLogin onSuccess={handleLoginSuccess} />;
};
