import { Stack } from "expo-router";

export default function PaymentsTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="spendings" />
    </Stack>
  );
}
