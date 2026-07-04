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

// Обязательно для корректной работы WebBrowser на Android
WebBrowser.maybeCompleteAuthSession();

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

  // Ссылка для возврата в приложение (схема настраивается в app.json)
  const redirectUrl = Linking.createURL("auth-redirect");

  // Слушаем возвращение из браузера (Deep Link от бэкенда)
  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const { path, queryParams } = Linking.parse(event.url);

    // Если бэк отправил пользователя назад с токеном
    if (queryParams && queryParams.token) {
      const jwtToken = queryParams.token as string;

      console.log("=== ТОКЕН ПОЛУЧЕН ИЗ TELEGRAM ===");
      console.log(jwtToken); // Выведет ваш токен в консоль Metro Bundler

      setAccessToken(jwtToken);
      WebBrowser.dismissBrowser(); // Закрываем окно браузера
      router.replace("/profile");
    }
  };

  const handleTelegramLogin = async () => {
    setServerError(null);

    // Важно: меняем response_type на "id_token" и добавляем nonce (любая случайная строка)
    // В redirect_uri передаем схему вашего мобильного приложения, чтобы ТГ вернул ответ прямо в телефон!
    const telegramAuthUrl =
      `https://oauth.telegram.org/auth?` +
      `client_id=8925590183` +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}` + // Возвращаем сразу в приложение
      `&response_type=id_token` + // ТГ сам поймет, что нужно сразу отдать JWT токен
      `&scope=user` +
      `&nonce=flashmind_test_nonce`; // Обязательный параметр для id_token

    try {
      // Открываем браузер внутри приложения
      const result = await WebBrowser.openAuthSessionAsync(
        telegramAuthUrl,
        redirectUrl,
      );

      // Если вход успешный, Telegram вернет URL с токеном прямо сюда!
      if (result.type === "success" && result.url) {
        // Разбираем URL, который вернул Telegram
        const parsedUrl = Linking.parse(result.url);

        // Ловим id_token (он обычно приходит в хэше # или query параметрах)
        const idToken =
          parsedUrl.queryParams?.id_token ||
          parsedUrl.hash?.match(/id_token=([^&]+)/)?.[1];

        if (idToken) {
          console.log("=== УСПЕХ! ТОКЕН ПОЛУЧЕН НА ФРОНТЕНДЕ ===");
          console.log("id_token:", idToken); // Вот ваш заветный токен в консоли Metro!

          // Сохраняем и идем в профиль
          setAccessToken(idToken);
          router.replace("/profile");
        } else {
          console.log("URL вернулся, но токена в нем нет:", result.url);
        }
      }
    } catch (error) {
      setServerError("Не удалось открыть авторизацию Telegram");
      console.error(error);
    }
  };

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

            {/* Новая кнопка Telegram в стиле вашего UI */}
            <Pressable
              onPress={handleTelegramLogin}
              style={({ pressed }) => [
                {
                  backgroundColor: "#229ED9", // Фирменный цвет Telegram
                  paddingVertical: 12,
                  borderRadius: 20, // Делаем кнопку округлой как на макете
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  opacity: pressed ? 0.9 : 1, // Эффект нажатия
                  gap: 8,
                },
              ]}
            >
              <Image
                source={tgIcon}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />

              <Typography
                variant="h2"
                style={{
                  color: "white",
                }}
              >
                Войти через Telegram
              </Typography>
            </Pressable>

            {/* Кнопка регистрации */}
            <SecondButton title="Регистрация" onPress={handleRegister} />
          </View>
        </View>
      </View>
    </View>
  );
}
