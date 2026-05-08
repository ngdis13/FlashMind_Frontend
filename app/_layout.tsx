import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";

import MontserratRegular from "@/assets/fonts/Montserrat-Regular.ttf";
import MontserratMedium from "@/assets/fonts/Montserrat-Medium.ttf";
import MontserratSemiBold from "@/assets/fonts/Montserrat-SemiBold.ttf";
import MontserratBold from "@/assets/fonts/Montserrat-Bold.ttf";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth.store";

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
    <Stack
      screenOptions={{
        headerShown: false,
        // 1. Меняем на слайд справа (как в iOS/современном Android)
        animation: "slide_from_right",

        // 2. Устанавливаем белый фон контента, чтобы при переходе не было серых пустот
        contentStyle: { backgroundColor: "#fff" },

        // 3. Улучшаем плавность жеста "назад" (свайп от левого края)
        gestureEnabled: true,
        gestureDirection: "horizontal",

        // 4. Тип анимации при замене экрана (например, после логина)
        animationTypeForReplace: "push",
      }}
    >
      {/* 
         Если хочешь, чтобы конкретные экраны открывались иначе 
         (например, создание колоды снизу), можно добавить их сюда:
      */}
      <Stack.Screen
        name="create-decks"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
