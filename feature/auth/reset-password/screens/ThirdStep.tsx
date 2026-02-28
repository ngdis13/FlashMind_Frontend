import React, { useState } from "react";
import { View, Pressable, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ────────────────────────────────────────────────
// Стили и цвета
// ────────────────────────────────────────────────
import { styles } from "../styles/ThirdStep.styles";
import { colors } from "@/styles/Colors";

// ────────────────────────────────────────────────
// Компоненты UI
// ────────────────────────────────────────────────
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import { Typography } from "@/styles/Typography";

// ────────────────────────────────────────────────
// Иконки
// ────────────────────────────────────────────────
import { OpenEyesIcon } from "../../assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "../../assets/Icons/CloseEyesIcon";

// ────────────────────────────────────────────────
// API, хранилища и типы
// ────────────────────────────────────────────────
import { changePassword } from "../api/resetPassword.api";
import { AxiosError } from "axios";
import { useAuthStore } from "../../../../store/auth.store";

/**
 * Третий шаг сброса пароля — ввод и подтверждение нового пароля.
 *
 * Пользователь дважды вводит новый пароль, выполняется базовая клиентская валидация,
 * затем отправляется запрос на сервер. При успехе сохраняется новый access_token
 * и происходит переход на финальный экран.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function ThirdStepResetPassword() {
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const [loading, setLoading] = useState(false);

  const { setAccessToken } = useAuthStore();

  const isButtonActive =
    password.trim() !== "" && confirmPassword.trim() !== "";

  const router = useRouter();

    /**
   * Основная функция обработки нажатия кнопки «Сбросить пароль».
   *
   * Проводит клиентскую валидацию → при успехе отправляет запрос на сервер →
   * сохраняет новый токен → перенаправляет на финальный экран.
   *
   * @async
   */
  const handleContinue = async () => {
    Keyboard.dismiss();
    let hasError = false;

    // сброс предыдущих ошибок
    setPasswordError(false);
    setConfirmError(false);
    setError("");

    if (password.length < 8) {
      setPasswordError(true);
      setError("Пароль должен быть не менее 8 символов");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      if (!passwordError) {
        setError("Пароли не совпадают");
      }
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const resp = await changePassword({ password });
      if (resp.access_token) {
        setAccessToken(resp.access_token);
      }
      router.replace("/reset-password/last-step");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        setError(data?.message || "Произошла ошибка при сбросе пароля");
      } else if (err instanceof Error) {
        setError(err.message.replace("Value error,", ""));
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Введите новый пароль
      </Typography>

      <View style={styles.content}>
        {/* Password */}
        <View style={styles.passwordWrapper}>
          <Input
            style={[
              styles.input,
              passwordError ? styles.inputError : undefined,
            ]}
            placeholder="Пароль*"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
          />

          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Скрыть пароль" : "Показать пароль"
            }
          >
            {showPassword ? <OpenEyesIcon /> : <CloseEyesIcon />}
          </Pressable>
        </View>

        {/* Confirm password */}
        <Typography variant="h2">Подтвердите пароль</Typography>

        <View style={styles.passwordWrapper}>
          <Input
            style={[styles.input, confirmError ? styles.inputError : undefined]}
            placeholder="Пароль*"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>

        {error ? (
          <Typography variant="h3" color={colors.errorColor} style={{maxWidth: 400}}>
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
