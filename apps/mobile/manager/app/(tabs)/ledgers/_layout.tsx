import { Stack } from "expo-router";

export default function LedgersTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="customers/day" />
      <Stack.Screen name="customers/detail" />
      <Stack.Screen name="customers/history" />
      <Stack.Screen name="customers/bill" />
      <Stack.Screen name="sellers/day" />
      <Stack.Screen name="sellers/history" />
      <Stack.Screen name="[type]/[userId]" />
    </Stack>
  );
}
