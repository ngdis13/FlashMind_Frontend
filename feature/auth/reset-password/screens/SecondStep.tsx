import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// --------------- Стили ----------------
import { styles } from "@/feature-auth/reset-password/styles/SecondStep.styles";

// --------------- Компоненты ----------------
import { Typography } from "@/styles/Typography";
import { CodeInput } from "@/feature-auth/components/CodeInput";

// --------------- Цвета ----------------
import { colors } from "@/styles/Colors";

// --------------- API и хуки ----------------
import { verifyResetCode, resendResetCode } from "@/feature-auth/reset-password/api/resetPassword.api";
import { useResetPasswordStore } from "@/feature-auth/store/resetPassword.store";
import { AxiosError } from "axios";
import { useInterval } from "@/feature-auth/hooks/useInterval";

/**
 * Экран второго шага сброса пароля, где пользователь вводит код подтверждения,
 * отправленный на его email. На этом шаге происходит верификация кода.
 * Также предусмотрена возможность повторной отправки кода.
 *
 * @component
 * @returns {JSX.Element} Компонент второго шага сброса пароля.
 */
export default function SecondStepResetPassword() {
  const router = useRouter();

  const [secondLeft, setSecondLeft] = useState(60); // Состояние для таймера обратного отсчета.
  const [canResend, setCanResend] = useState(false); // Состояние для активации повторной отправки кода.
  const [error, setError] = useState(""); // Состояние для отображения ошибки.
  const [loading, setLoading] = useState(false); // Состояние для индикации загрузки.

  const { email, setResetToken } = useResetPasswordStore(); // Хук для работы с хранилищем сброса пароля.

  // ---------------------------
  // Таймер обратного отсчета (улучшен с useInterval)
  useInterval(() => {
    if (secondLeft > 0) {
      setSecondLeft((prev) => prev - 1);
    } else {
      setCanResend(true); // Разрешаем повторную отправку после завершения отсчета.
    }
  }, secondLeft > 0 ? 1000 : null); // null останавливает интервал

  // ---------------------------
  // Функция для проверки введенного кода
  const handleCodeFilled = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const resp = await verifyResetCode({ email, code });

      if (!resp.access_token) {
        setError(
          "Не удалось подтвердить код. Проверьте email или запросите новый код."
        );
        return;
      }

      setResetToken(resp.access_token); // Сохраняем токен для сброса пароля.
      router.push("/reset-password/third-step"); // Переход на следующий шаг.
    } catch (err: unknown) {
      // Обработка ошибок
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        if (data?.detail) {
          if (Array.isArray(data.detail)) setError(data.detail[0]?.msg);
          else setError(data.detail);
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError(err.message ?? "Ошибка при проверке кода");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Функция для повторной отправки кода
  const handleResendCode = async () => {
    if (!email) {
      setError("Email не найден. Начните заново.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      await resendResetCode({ email });
      setSecondLeft(60); // Сброс таймера.
      setCanResend(false); // Блокировка кнопки повторной отправки до конца отсчета.
    } catch (err: unknown) {
      // Обработка ошибок повторной отправки
      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        setError(data?.message || "Произошла ошибка сброса пароля");
      } else if (err instanceof Error) {
        setError(err.message.replace("Value error,", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Мы отправили код подтверждения сброса пароля на вашу почту
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">Пожалуйста, введите код</Typography>
        <Typography variant="h3" color={"#585858"}>
          Если код не пришел, проверьте папку спам
        </Typography>
      </View>

      <CodeInput length={6} onCodeFilled={handleCodeFilled} />

      {error ? (
        <Typography
          variant="h3"
          color={colors.errorColor}
          style={{
            alignSelf: "center",
            maxWidth: 350,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {error}
        </Typography>
      ) : null}

      {canResend ? (
        <Pressable onPress={handleResendCode} disabled={loading}>
          <Typography
            variant="h3"
            color={colors.darkMainColor}
            style={{ textDecorationLine: "underline" }}
          >
            Отправить код повторно
          </Typography>
        </Pressable>
      ) : (
        <Typography variant="h3" color={colors.darkGray}>
          Отправить код повторно через {secondLeft} сек
        </Typography>
      )}
    </SafeAreaView>
  );
}
