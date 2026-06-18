import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";

import Toast, { BaseToast, type ToastConfig } from "react-native-toast-message";
import { View, Text } from "react-native";

import MontserratRegular from "@/assets/fonts/Montserrat-Regular.ttf";
import MontserratMedium from "@/assets/fonts/Montserrat-Medium.ttf";
import MontserratSemiBold from "@/assets/fonts/Montserrat-SemiBold.ttf";
import MontserratBold from "@/assets/fonts/Montserrat-Bold.ttf";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth.store";

import { SuccessIcon } from "@/assets/icons/TostIcon/SuccessIcon";
import { ErrorIcon } from "@/assets/icons/TostIcon/ErrorIcon";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <View
      style={{
        height: 40,
        maxWidth: 750,
        width: "95%",
        backgroundColor: "#22C775",
        borderRadius: 15,
        justifyContent: "center",
        paddingHorizontal: 20,
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
      }}
    >
      <SuccessIcon />
      <Typography variant="h2" color={colors.white}>
        {text1}
      </Typography>
    </View>
  ),
  error: ({ text1, text2 }) => {
    // Проверяем, передан ли второй текст
    const hasText2 = Boolean(text2 && text2.trim().length > 0);

    return (
      <View
        style={{
          minHeight: 40, 
          maxWidth: 750,
          width: "95%",
          backgroundColor: "#FA2C56",
          borderRadius: 15,
          paddingHorizontal: 20,
          paddingVertical: hasText2 ? 12 : 8,
          flexDirection: "row",
          gap: 8,
          alignItems: "center", 
        }}
      >

        <View style={{ marginTop: hasText2 ? 2 : 0 }}>
          <ErrorIcon />
        </View>

        <View style={{ flex: 1, flexDirection: "column" }}>
          <Typography variant="h2" color={colors.white}>
            {text1}
          </Typography>

          {hasText2 && (
            <Typography
              variant="h3" 
              color={colors.white}
              style={{ marginTop: 4, opacity: 0.85 }} 
            >
              {text2}
            </Typography>
          )}
        </View>
      </View>
    );
  },
};

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { user, fetchUser } = useUserStore();
  const access_token = useAuthStore.getState().accessToken;

  const [fontsLoaded] = useFonts({
    MontserratRegular: MontserratRegular,
    MontserratMedium: MontserratMedium,
    MontserratSemiBold: MontserratSemiBold,
    MontserratBold: MontserratBold,
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();

    if (fontsLoaded && !fetchedRef.current && !access_token) {
      fetchedRef.current = true;
      fetchUser();
    }
  }, [fontsLoaded, user]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#fff" },
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animationTypeForReplace: "push",
        }}
      >
        <Stack.Screen
          name="create-decks"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>

      <Toast config={toastConfig} />
    </>
  );
}
