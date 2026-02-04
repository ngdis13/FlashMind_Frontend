import { useState } from "react";
import { useRouter } from "expo-router";
import { startRegistration } from "../../api/registerApi";
import { getErrorMessage } from "../shared/getErrorMessage";

export function useStartRegistration() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await startRegistration(email, password);

      router.push({
        pathname: "/register/step-confirm-email",
        params: { email },
      });
    } catch (err: unknown) {
        setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    start,
    loading,
    error,
  };
}
