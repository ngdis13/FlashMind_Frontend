import { useState } from "react";
import { resendCode } from "../../api/registerApi"; 

export function useResendRegistrationCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await resendCode(email);
    } catch (err: any) {
      setError(err.message || "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  return {
    resend,
    loading,
    error,
  };
}
