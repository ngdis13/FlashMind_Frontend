import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import { Typography } from "@/styles/Typography";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { Logo } from "@/components/Logo";

interface LoadingScreenProps {
  textLoad: string;
}

export default function LoadingScreen({ textLoad }: LoadingScreenProps) {
  const router = useRouter();
  //Возвращаем пользователя назад при нажатии
  const handleSkip = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={handleSkip}>
      <SafeAreaView style={styles.container}>
        <Logo size={150} style={{ marginBottom: 16 }} />
        <Text style={styles.logoText}>flashmind</Text>
        <View style={styles.textContainer}>
          <Typography variant="h2" color="#FFFFFF">
            {textLoad}
          </Typography>
          <Typography variant="h2" color="#FFFFFF" style={{textAlign: "center"}}>
            Подождите или нажмите, чтобы вернуться назад
          </Typography>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6E75D9",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 190,
    height: 190,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    color: "#FFFFFF",
    fontFamily: "MontserratSemibold",
  },
  textContainer: {
    position: "absolute",
    bottom: 100,
    gap: 8,
    alignItems: "center",
    maxWidth: 400,
  },
});
