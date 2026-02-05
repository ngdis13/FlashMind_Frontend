import { useState } from "react";
import { resendCode } from "../../api/registerApi"; 
import { AxiosError } from "axios";

export function useResendRegistrationCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await resendCode(email);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || err.message || "Не удалось отправить код");
      } else if (err instanceof Error) {
        setError(err.message || "Не удалось отправить код");
      } else {
        setError("Не удалось отправить код");
      }
    }
  };

  return {
    resend,
    loading,
    error,
  };
}
