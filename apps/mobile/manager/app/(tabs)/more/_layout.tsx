import { Stack } from "expo-router";

export default function MoreTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="realtime" />
      <Stack.Screen name="debug" />
      <Stack.Screen name="users" />
      <Stack.Screen name="products" />
      <Stack.Screen name="stock" />
      <Stack.Screen name="ledgers/index" />
      <Stack.Screen name="ledgers/[type]/[userId]" />
      <Stack.Screen name="quotes/index" />
      <Stack.Screen name="quotes/[quoteId]" />
    </Stack>
  );
}
