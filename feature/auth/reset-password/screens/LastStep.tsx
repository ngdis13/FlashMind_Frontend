import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// --------------------------- Стили ---------------------------
import { styles } from "../styles/LastStep.styles";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { Typography } from "@/styles/Typography";
import { Logo } from "@/components/Logo";

// --------------------------- Стор и хуки ---------------------------
import { useAuthStore } from "../../store/auth.store";

/**
 * Экран последнего шага сброса пароля.
 * Показывает сообщение об успешном сбросе и кнопку для входа в систему.
 *
 * Если пользователь не имеет действительного accessToken, 
 * происходит перенаправление на главную страницу ("/").
 *
 * @component
 * @returns {JSX.Element} Компонент последнего шага сброса пароля
 */
export default function LastStepResetPassword() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  // ---------------------------
  // Проверка наличия accessToken при загрузке экрана
  useEffect(() => {
    if (!accessToken) {
      router.push("/"); // Перенаправление на главную страницу, если токен отсутствует
    }
  }, [accessToken]);

  // ---------------------------
  // Обработчик кнопки "Вход в систему"
  const handleContinue = () => {
    router.push("/"); // Переход на страницу пользователя
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo />

      <Typography variant="h1" style={styles.pageNames}>
        Успешный сброс пароля
      </Typography>

      <View style={styles.buttonContainer}>
        <MainButton title="Вход в систему" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
