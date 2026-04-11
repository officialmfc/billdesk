import { Stack } from "expo-router";

export default function OperationsTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="due" />
      <Stack.Screen name="chalans" />
      <Stack.Screen name="buyers" />
      <Stack.Screen name="verification" />
    </Stack>
  );
}
