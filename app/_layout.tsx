import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import MontserratRegular from '../assets/fonts/Montserrat-Regular.ttf';
import MontserratMedium from '../assets/fonts/Montserrat-Medium.ttf';
import MontserratSemiBold from '../assets/fonts/Montserrat-SemiBold.ttf';
import MontserratBold from '../assets/fonts/Montserrat-Bold.ttf';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    MontserratRegular: MontserratRegular,
    MontserratMedium: MontserratMedium,
    MontserratSemiBold: MontserratSemiBold,
    MontserratBold: MontserratBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationTypeForReplace: 'pop',
        gestureEnabled: true,
        presentation: 'card',
      }}
    />
  );
}
