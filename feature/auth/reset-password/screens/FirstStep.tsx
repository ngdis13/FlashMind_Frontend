import React, { useState } from "react";

// --------------- Компоненты и хуки ----------------
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";

// --------------- Стили и цвета ----------------
import { styles } from "@/feature-auth/reset-password/styles/FirstStep.styles";
import { colors } from "@/styles/Colors";

// --------------- Вспомогательные компоненты ----------------
import { Typography } from "@/styles/Typography";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";

// --------------- Валидация и API ----------------
import { isValidEmail } from "@/feature-auth/validators/email.validator";
import { resetPassword } from "@/feature-auth/reset-password/api/resetPassword.api";
import { useResetPasswordStore } from "@/feature-auth/store/resetPassword.store";

/**
 * Экран первого шага сброса пароля, где пользователь вводит свой email.
 * На этом экране пользователь предоставляет свой email, чтобы получить код для сброса пароля.
 * После валидации email, система отправляет запрос для сброса пароля.
 *
 * @component
 * @returns {JSX.Element} Компонент первого шага сброса пароля.
 */
export default function FirstStepResetPassword() {
  const [emailInput, setEmailInput] = useState(""); // Состояние для хранения введенного email.
  const [error, setError] = useState(""); // Состояние для ошибок.
  const [loading, setLoading] = useState(false); // Состояние для загрузки.

  const { setEmail } = useResetPasswordStore(); // Хук для работы с хранилищем сброса пароля.

  const isButtonActive = emailInput.trim() !== ""; // Проверка активности кнопки (кнопка активна, если введен email).

  const router = useRouter(); // Хук для навигации между экранами.

  /**
   * Обработчик нажатия на кнопку продолжить (сброс пароля).
   * Выполняет проверку на валидность email и отправляет запрос на сброс пароля.
   * Если email валиден, происходит переход ко второму шагу сброса пароля.
   *
   * @async
   * @function handleContinue
   */
  const handleContinue = async () => {
    setError(""); // Сбрасываем ошибку.

    // Проверка валидности email.
    if (!isValidEmail(emailInput)) {
      setError("Неверный email"); // Устанавливаем ошибку, если email невалидный.
      return;
    }

    setLoading(true); // Устанавливаем состояние загрузки.

    try {
      // Отправка запроса на сброс пароля.
      await resetPassword({ email: emailInput });
      setEmail(emailInput); // Сохраняем email в хранилище.

      // Переход ко второму шагу.
      router.push("/reset-password/second-step");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.message ?? "Произошла ошибка"); // Обработка ошибки при запросе.
      }
    } finally {
      setLoading(false); // Снимаем состояние загрузки.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Введите ваш адрес электронной почты
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">
          Мы отправим вам код для сброса пароля
        </Typography>

        <Input
          style={[styles.input, error ? styles.inputError : undefined]}
          placeholder="Email*"
          value={emailInput}
          onChangeText={setEmailInput}
          autoCapitalize="none"
        />

        {error ? (
          <Typography
            variant="h3"
            color={colors.errorColor}
            style={{ alignSelf: "center" }}
          >
            {error}
          </Typography>
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <MainButton
          title={loading ? "Отправка..." : "Сбросить пароль"}
          onPress={handleContinue}
          disabled={!isButtonActive}
        />
      </View>
    </SafeAreaView>
  );
}
