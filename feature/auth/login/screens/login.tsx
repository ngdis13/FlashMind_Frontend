import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";
import { View, Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuthStore } from "../../../../store/auth.store";
import { login } from "../api/login.api";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { OpenEyesIcon } from "../../assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "../../assets/Icons/CloseEyesIcon";
import tgIcon from "@/feature-profile/assets/TgIcon.png";

// --------------------------- Вспомогательные функции ---------------------------
import { isValidEmail } from "../../validators/email.validator";

// --------------------------- Стили ---------------------------
import { styles } from "../styles/login.styles";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";
import { colors } from "@/styles/Colors";



export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isButtonActive = email.trim() !== "" && password.trim() !== "";
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);


  const handleLogin = async () => {
    let hasError = false;
    if (!isValidEmail(email)) {
      setEmailError(true);
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }
    if (hasError) return;

    try {
      const data = await login({
        email: email.trim(),
        password: password.trim(),
      });
      setAccessToken(data.access_token);
      router.replace("/profile");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        if (data?.message)
          setServerError(data.message.replace("Value error,", ""));
      } else if (err instanceof Error) {
        setServerError(err.message.replace("Value error,", ""));
      } else {
        setServerError("Неизвестная ошибка");
      }
    }
  };

  const handleRegister = () => router.push("/register");
  const handleChangePassword = () => router.push("/reset-password");

  return (
    <View style={commonStyles.viewContainer}>
      <View style={commonStyles.container}>
        <View style={styles.container}>
          <Logo size={150} style={{ marginBottom: 16 }} />

          <Typography variant="h1" style={styles.title}>
            Добро пожаловать в Flashmind!
          </Typography>

          <View style={styles.inputContainer}>
            <Input
              style={[styles.input, emailError ? styles.inputError : undefined]}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
            />

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
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={10}
                style={styles.eyeButton}
              >
                {showPassword ? <OpenEyesIcon /> : <CloseEyesIcon />}
              </Pressable>
            </View>
          </View>

          <View style={styles.errorContainer}>
            {serverError ? (
              <Typography variant="h3" style={styles.errorMessage}>
                {serverError}
              </Typography>
            ) : null}
          </View>

          <Pressable onPress={handleChangePassword}>
            <Typography variant="h2">Забыли пароль?</Typography>
          </Pressable>

          {/* Кнопки для входа, ТГ и регистрации */}
          <View style={[styles.buttonContainer, { gap: 10, marginTop: 20 }]}>
            {/* Основная кнопка входа */}
            <MainButton
              title="Войти"
              onPress={handleLogin}
              disabled={!isButtonActive}
            />

            {/* Кнопка регистрации */}
            <SecondButton title="Регистрация" onPress={handleRegister} />
          </View>
        </View>
      </View>
    </View>
  );
}
