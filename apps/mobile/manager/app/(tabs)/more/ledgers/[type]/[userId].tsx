import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyLedgerDetailRoute() {
  const params = useLocalSearchParams<{ type?: string; userId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const type = params.type === "seller" ? "seller" : "customer";

  return (
    <Redirect
      href={type === "seller" ? `/ledgers/sellers/history?userId=${encodeURIComponent(userId)}` : `/ledgers/customers/detail?userId=${encodeURIComponent(userId)}`}
    />
  );
}
