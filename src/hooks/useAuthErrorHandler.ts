import { useNavigate } from "react-router-dom";
import { removeAuthToken } from "@/lib/auth";
import { toast } from "sonner";

export const useAuthErrorHandler = () => {
  const navigate = useNavigate();

  const handleAuthError = (error: Error) => {
    if (error.message === "UNAUTHORIZED" || error.message === "TOKEN_EXPIRED") {
      removeAuthToken();
      toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      navigate("/admin");
    }
  };

  return { handleAuthError };
};

