import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Alert, Pressable } from "react-native";
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { styles } from "../styles/login.styles";
import { isValidEmail } from "../../validators/email.validator";
import { Typography } from "@/styles/Typography";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { OpenEyesIcon } from "../../assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "../../assets/Icons/CloseEyesIcon";
import { useAuthStore } from "../../store/auth.store";
import { login } from "../api/authApi";
import { colors } from "@/styles/Colors";

interface Errors {
  email: boolean;
  password: boolean;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null); // Ошибка от сервера

  const isButtonActive = email.trim() !== "" && password.trim() !== "";
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  /**
   * Обрабатывает клик по кнопке "Войти".
   * Проверяет корректность введенного email и пароля.
   * Если email корректный, переходит на страницу.
   */
  const handleLogin = async () => {
    // Сбрасываем ошибки
    setServerError(null);
    setErrors({ email: false, password: false });

    // 1. Валидация на клиенте ПЕРЕД запросом
    let hasError = false;

    if (!isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: true }));
      hasError = true;
    }

    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: true }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const data = await login({
        email: email.trim(),
        password: password.trim(),
      });

      setAccessToken(data.access_token);
      Alert.alert("Успех", "Вы вошли в систему!");
      router.replace("/not-found");
    } catch (err: any) {
      const msg = err.message || "Не удалось войти. Проверьте email и пароль.";
      setServerError(msg.split(",").pop()?.trim());

      if (msg.toLowerCase().includes("пароль")) {
        setErrors((prev) => ({ ...prev, password: true }));
      }

      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: true }));
      }
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleChangePassword = () => {
    router.push("/reset-password");
  };

  return (
    <View style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />
      <Typography variant="h1" style={styles.title}>
        Добро пожаловать в Flashmind!
      </Typography>

      <View style={styles.errorContainer}>
        {serverError ? (
          <Typography variant="h3" style={styles.errorMessage}>
            {serverError}
          </Typography>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Input
          style={[styles.input, errors.email ? styles.inputError : undefined]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
        />

        <View style={styles.passwordWrapper}>
          <Input
            style={[
              styles.input,
              errors.password ? styles.inputError : undefined,
            ]}
            placeholder="Пароль*"
            value={password}
            onChangeText={(text) => setPassword(text)}
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
      </View>

      <Pressable onPress={handleChangePassword}>
        <Typography variant="h2">Забыли пароль?</Typography>
      </Pressable>

      <View style={styles.buttonContainer}>
        <MainButton
          title="Войти"
          onPress={handleLogin}
          disabled={!isButtonActive}
        />
        <SecondButton title="Регистрация" onPress={handleRegister} />
      </View>
    </View>
  );
}
