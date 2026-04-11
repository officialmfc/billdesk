import { Tabs, useRouter } from "expo-router";
import {
  BookCopy,
  FileText,
  Home,
  Menu,
  ShoppingBag,
  WalletCards,
} from "lucide-react-native";
import { managerMobileTabs, type ManagerNavigationKey } from "@mfc/manager-ui";

import { appColors } from "@/lib/theme";

const iconByKey: Record<ManagerNavigationKey, typeof Home> = {
  home: Home,
  sales: ShoppingBag,
  operations: FileText,
  payments: WalletCards,
  spendings: WalletCards,
  ledgers: BookCopy,
  quotes: FileText,
  approvals: FileText,
  users: Menu,
  products: ShoppingBag,
  stock: ShoppingBag,
  settings: Menu,
};

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: appColors.surface,
          borderTopColor: appColors.border,
        },
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      {managerMobileTabs.map((tab) => {
        const Icon = iconByKey[tab.key];

        return (
          <Tabs.Screen
            key={tab.mobileRoute}
            name={tab.mobileRoute!}
            listeners={
              tab.key === "sales" || tab.key === "ledgers"
                ? {
                    tabPress: (event) => {
                      event.preventDefault();
                      router.push((tab.key === "sales" ? "/sale-type" : "/ledger-type") as never);
                    },
                  }
                : undefined
            }
            options={{
              title: tab.label,
              tabBarLabel: tab.label,
              tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
            }}
          />
        );
      })}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarLabel: "More",
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
