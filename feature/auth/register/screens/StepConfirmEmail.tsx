import React, { useState, useEffect } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "@/styles/Typography";
import { useRouter } from "expo-router";

// --------------------------- Стили ---------------------------
import { styles } from "../styles/StepConfirmEmail.styles";

// --------------------------- Компоненты ---------------------------
import { CodeInput } from "@/feature-auth/components/CodeInput";

// --------------------------- Цвета ---------------------------
import { colors } from "@/styles/Colors";

// --------------------------- Сторы и API ---------------------------
import { useAuthStore } from "../../store/auth.store";
import { useRegistrationStore } from "../../store/register.store";
import { resendCode, verifyCode } from "../api/registerApi";
import { AxiosError } from "axios";

/**
 * Экран подтверждения email для регистрации.
 * Пользователь вводит код, который был отправлен на его почту.
 * В случае успешной верификации, происходит переход на экран onboarding.
 * Также предусмотрена возможность повторной отправки кода через таймер.
 *
 * @component
 * @returns {JSX.Element} Компонент для ввода кода подтверждения.
 */
export default function StepConfirmEmail() {
  const router = useRouter();
  const { email } = useRegistrationStore((s) => s); // Получаем email из состояния регистрации
  const setAccessToken = useAuthStore((s) => s.setAccessToken); // Устанавливаем accessToken

  // ---------------------------
  // Состояния для таймера, ошибок и загрузки
  const [secondLeft, setSecondLeft] = useState(60); // Таймер для отсчета времени для повторной отправки кода
  const [canResend, setCanResend] = useState(false); // Разрешение на повторную отправку
  const [loading, setLoading] = useState(false); // Статус загрузки
  const [error, setError] = useState<string | null>(null); // Состояние ошибки

  // ---------------------------
  // Таймер обратного отсчета
  useEffect(() => {
    if (secondLeft === 0) {
      setCanResend(true); // Разрешаем повторную отправку, если таймер закончен
      return;
    }

    const timer = setTimeout(() => {
      setSecondLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer); // Очистка таймера при изменении состояния
  }, [secondLeft]);

  /**
   * Обрабатывает введенный код и выполняет его проверку.
   * В случае успеха, сохраняет токен и переходит на экран onboarding.
   * В случае ошибки, отображает сообщение.
   *
   * @param {string} code - Код, введенный пользователем
   */
  const handleCodeFilled = async (code: string) => {
    setLoading(true);
    setError(null); // Сбрасываем ошибку

    try {
      const { access_token } = await verifyCode({email, code});
      setAccessToken(access_token); // Сохраняем токен
      router.push("/onboarding"); // Переход на следующий экран
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Неверный код");
      }
    } finally {
      setLoading(false); // Сбрасываем статус загрузки
    }
  };

  /**
   * Обрабатывает повторную отправку кода на email пользователя.
   * Сбрасывает таймер и статус повторной отправки.
   */
  const handleResendCode = async () => {
    if (!email || !canResend) return; // Если email нет или повторная отправка не разрешена

    setLoading(true);
    setError(null); // Сбрасываем ошибку

    try {
      await resendCode({email}); // Отправляем запрос на повторную отправку кода
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Не удалось отправить код"
        );
      } else if (err instanceof Error) {
        setError(err.message || "Не удалось отправить код");
      } else {
        setError("Не удалось отправить код");
      }
    }

    setSecondLeft(60); // Сбрасываем таймер
    setCanResend(false); // Блокируем возможность повторной отправки до завершения таймера
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок страницы */}
      <Typography variant="h1" style={styles.pageNames}>
        Мы отправили код подтверждения регистрации на вашу почту
      </Typography>

      {/* Информационный блок */}
      <View style={styles.infoContainer}>
        <Typography variant="h2">Пожалуйста, введите код</Typography>
        <Typography variant="h3" color={"#585858"}>
          Если код не пришел, проверьте папку спам
        </Typography>
      </View>

      {/* Компонент для ввода кода */}
      <CodeInput length={6} onCodeFilled={handleCodeFilled} />

      {/* Сообщение об ошибке при неверном коде */}
      {error && (
        <Typography
          style={{ maxWidth: 400, marginBottom: 8, textAlign: "center" }}
          variant="h3"
          color={colors.errorColor}
        >
          {error}
        </Typography>
      )}

      {/* Возможность повторной отправки кода */}
      {canResend ? (
        <Pressable onPress={handleResendCode}>
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
