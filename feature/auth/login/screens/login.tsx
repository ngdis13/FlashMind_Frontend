import React, { useState } from "react";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";
import { View, Pressable } from "react-native";
import { useAuthStore } from "../../../../store/auth.store";
import { login } from "../api/login.api";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { OpenEyesIcon } from "../../assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "../../assets/Icons/CloseEyesIcon";

// --------------------------- Вспомогательные функции ---------------------------
import { isValidEmail } from "../../validators/email.validator";

// --------------------------- Стили ---------------------------
import { styles } from "../styles/login.styles";
import { Typography } from "@/styles/Typography";

/**
 * Экран авторизации пользователя. Пользователь вводит email и пароль для входа.
 * В случае успешной авторизации, сохраняется токен доступа и происходит переход на другой экран.
 * Также предусмотрены ссылки на страницы регистрации и восстановления пароля.
 *
 * @component
 * @example
 * return (
 *   <LoginScreen />
 * )
 */
export default function LoginScreen() {
  const [email, setEmail] = useState(""); // Состояние для хранения email
  const [password, setPassword] = useState(""); // Состояние для хранения пароля
  /** Состояние ошибок валидации полей */
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [showPassword, setShowPassword] = useState(false); // Состояние для отображения пароля
  const [serverError, setServerError] = useState<string | null>(null); // Ошибка с сервера

  const isButtonActive = email.trim() !== "" && password.trim() !== ""; // Проверка активности кнопки
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken); // Установка токена в хранилище

  /**
   * Обрабатывает клик по кнопке "Войти".
   * Проверяет email и пароль, выполняет авторизацию через API.
   * Если авторизация успешна, сохраняет токен и переходит на следующий экран.
   * В случае ошибки отображает сообщение пользователю.
   *
   * @async
   * @function
   */
  const handleLogin = async () => {
    let hasError = false;

    // Валидация email и пароля
    if (!isValidEmail(email)) {
      setEmailError(true);
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      return; // Если есть ошибки валидации, не продолжаем авторизацию
    }

    try {
      const data = await login({
        email: email.trim(),
        password: password.trim(),
      });

      setAccessToken(data.access_token); // Сохраняем токен
      router.replace("/profile"); 
    } catch (err: unknown) {
      // Обработка ошибок с сервера
      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        if (data?.message) {
          setServerError(data.message.replace("Value error,", ""));
        }
      } else if (err instanceof Error) {
        setServerError(err.message.replace("Value error,", ""));
      } else {
        setServerError("Неизвестная ошибка");
      }
    }
  };

  /**
   * Переход на страницу регистрации.
   * @function
   */
  const handleRegister = () => {
    router.push("/register");
  };

  /**
   * Переход на страницу восстановления пароля.
   * @function
   */
  const handleChangePassword = () => {
    router.push("/reset-password");
  };

  return (
    <View style={styles.container}>
      {/* Логотип */}
      <Logo size={150} style={{ marginBottom: 16 }} />

      {/* Заголовок страницы */}
      <Typography variant="h1" style={styles.title}>
        Добро пожаловать в Flashmind!
      </Typography>

      {/* Контейнер с полями ввода */}
      <View style={styles.inputContainer}>
        {/* Поле ввода email */}
        <Input
          style={[styles.input, emailError ? styles.inputError : undefined]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
        />

        {/* Поле ввода пароля */}
        <View style={styles.passwordWrapper}>
          <Input
            style={[
              styles.input,
              passwordError ? styles.inputError : undefined,
            ]}
            placeholder="Пароль*"
            value={password}
            onChangeText={(text) => setPassword(text)}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
          />

          {/* Иконка для показа/скрытия пароля */}
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
      </View>

      {/* Сообщение об ошибке сервера */}
      <View style={styles.errorContainer}>
        {serverError ? (
          <Typography variant="h3" style={styles.errorMessage}>
            {serverError}
          </Typography>
        ) : null}
      </View>

      {/* Ссылка на восстановление пароля */}
      <Pressable onPress={handleChangePassword}>
        <Typography variant="h2">Забыли пароль?</Typography>
      </Pressable>

      {/* Кнопки для входа и регистрации */}
      <View style={styles.buttonContainer}>
        <MainButton
          title="Войти"
          onPress={handleLogin}
          disabled={!isButtonActive} // Кнопка активна только при заполнении обоих полей
        />
        <SecondButton title="Регистрация" onPress={handleRegister} />
      </View>
    </View>
  );
}
