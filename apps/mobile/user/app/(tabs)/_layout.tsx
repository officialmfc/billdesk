import { Tabs } from "expo-router";
import { Clock3, Receipt, Settings, Store } from "lucide-react-native";

import { useAppPreferences } from "@/contexts/AppPreferencesContext";

export default function TabsLayout() {
  const { sellerSectionEnabled } = useAppPreferences();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="seller"
        options={{
          title: "Seller",
          href: sellerSectionEnabled ? undefined : null,
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
