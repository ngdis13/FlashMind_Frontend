import { Stack } from "expo-router";

export default function CreateCardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="term-editor" />
      <Stack.Screen name="text-editor" />
      <Stack.Screen name="side-editor" />
      <Stack.Screen name="image-editor" />
      <Stack.Screen name="image-search" />
    </Stack>
  );
}