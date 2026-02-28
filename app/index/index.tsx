import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableWithoutFeedback } from "react-native";
import { styles } from "./index.styles";
import { Typography } from "@/styles/Typography";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/auth.store";
import { refreshToken } from "@/api/services/auth.service";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { access_token } = await refreshToken();
        useAuthStore.getState().setAccessToken(access_token); // Убедитесь, что обновили токен
        router.replace("/profile");
      } catch (error) {
        console.error("Ошибка при обновлении токенов:", error);
        router.replace("/login");
      }
    };

    bootstrap();
  }, [router]);

  const handleSkip = async () => {

  };

  return (
    <TouchableWithoutFeedback onPress={handleSkip}>
      <SafeAreaView style={styles.container}>
        <Logo size={150} style={{ marginBottom: 16 }} />
        <Text style={styles.logoText}>flashmind</Text>
        <Typography variant="h2" color="#FFFFFF" style={styles.bottomText}>
          Нажмите, чтобы продолжить
        </Typography>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
