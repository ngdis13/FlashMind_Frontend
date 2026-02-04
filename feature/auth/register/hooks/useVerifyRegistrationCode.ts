import { useState } from "react";
import { useRouter } from "expo-router";
import { verifyCode } from "../../api/registerApi"; 
import { useAuthStore } from "../../store/auth.store";

export function useVerifyRegistrationCode() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (email: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      const { access_token } = await verifyCode(email, code);
      setAccessToken(access_token)
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err.message || "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  return {
    verify,
    loading,
    error,
  };
}
