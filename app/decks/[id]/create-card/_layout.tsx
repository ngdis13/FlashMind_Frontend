import { Stack } from "expo-router";

export default function CreateCardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="term-editor" />
      <Stack.Screen name="text-editor" />
      <Stack.Screen name="side-editor" />
    </Stack>
  );
}
