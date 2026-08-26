import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function CreateCardLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create" />
        <Stack.Screen name="term-editor" />
        <Stack.Screen name="text-editor" />
        <Stack.Screen name="side-editor" />
        <Stack.Screen name="image-editor" />
        <Stack.Screen name="image-search" />
      </Stack>
    </GestureHandlerRootView>
  );
}