import React, { useState } from "react";
import { View, Pressable, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// --------------------------- Стили ---------------------------
import { styles } from "../styles/StepEmail.styles";

// --------------------------- Компоненты ---------------------------
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import { Typography } from "@/styles/Typography";
import { Logo } from "@/components/Logo";
import { OpenEyesIcon } from "@/feature-auth/assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "@/feature-auth/assets/Icons/CloseEyesIcon";

// --------------------------- Цвета ---------------------------
import { colors } from "@/styles/Colors";

// --------------------------- Валидация ---------------------------
import { isValidEmail } from "@/feature-auth/validators/email.validator";

// --------------------------- API и стор ---------------------------
import { AxiosError } from "axios";
import { startRegistration } from "../api/registerApi";
import { useRegistrationStore } from "../../store/register.store";

/**
 * Экран регистрации нового пользователя.
 * Позволяет пользователю ввести email, пароль и подтвердить пароль.
 * После успешной регистрации выполняется переход на экран подтверждения email.
 *
 * @component
 * @returns {JSX.Element} Компонент экрана регистрации
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { email, setEmail } = useRegistrationStore((s) => s);

  // ---------------------------
  // Состояния для формы
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false); // Отображение/скрытие пароля

  // ---------------------------
  // Состояния ошибок
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isFormFilled =
    emailInput.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  // ---------------------------
  // Обработчик кнопки "Продолжить"
  const handleContinue = async () => {
    Keyboard.dismiss();

    // Сброс ошибок перед новой проверкой
    setEmailError(false);
    setPasswordError(false);
    setConfirmError(false);
    setServerError(null);

    // ---------------------------
    // Валидация полей
    if (!isValidEmail(emailInput)) {
      setServerError("Email не существует");
      setEmailError(true);
      return;
    }

    if (password.length < 8) {
      setServerError("Пароль меньше 8 символов");
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setServerError("Пароли не совпадают");
      setConfirmError(true);
      return;
    }

    // ---------------------------
    // Отправка данных на сервер
    try {
      setEmail(emailInput.trim());
      await startRegistration({email: emailInput.trim(), password: password.trim()});
      router.push("/register/step-confirm-email");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        setServerError(data?.message || "Произошла ошибка при регистрации");
      } else if (err instanceof Error) {
        setServerError(err.message.replace("Value error,", ""));
      } else {
        setServerError("Неизвестная ошибка");
      }
    }
  };

  // ---------------------------
  // Переход на экран логина для уже зарегистрированных пользователей
  const handleHavingAccount = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Логотип */}
      <Logo size={150} style={{ marginBottom: 16 }} />

      {/* Заголовок страницы */}
      <Typography variant="h1" style={styles.pageNames}>
        Регистрация
      </Typography>

      {/* --------------------------- Форма --------------------------- */}
      <View style={styles.inputContainer}>
        {/* Email */}
        <Input
          style={[styles.input, emailError ? styles.inputError : undefined]}
          placeholder="Email*"
          value={emailInput}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEmailInput(text);
            if (emailError) setEmailError(false);
          }}
        />

        {/* Пароль */}
        <View style={styles.passwordWrapper}>
          <Input
            style={[styles.input, passwordError ? styles.inputError : undefined]}
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
            accessibilityLabel={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <OpenEyesIcon /> : <CloseEyesIcon />}
          </Pressable>
        </View>

        {/* Подтверждение пароля */}
        <Input
          style={[styles.input, confirmError ? styles.inputError : undefined]}
          placeholder="Подтверждение пароля*"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
        />

        {/* Ошибка сервера */}
        {serverError && (
          <Typography
            variant="h3"
            color={colors.errorColor}
            style={{ alignSelf: "center", textAlign: "center" }}
          >
            {serverError}
          </Typography>
        )}
      </View>

      {/* --------------------------- Кнопки --------------------------- */}
      <View style={styles.buttonContainer}>
        <MainButton title="Продолжить" onPress={handleContinue} disabled={!isFormFilled} />
        <Pressable onPress={handleHavingAccount}>
          <Typography variant="h2">У вас уже есть аккаунт?</Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
