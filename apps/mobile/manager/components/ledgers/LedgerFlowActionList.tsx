import { StyleSheet, View } from "react-native";
import { BookCopy, Clock3, FileSearch, ReceiptText, Wallet } from "lucide-react-native";
import { Text } from "react-native-paper";

import { ActionCard } from "@/components/ui/ActionCard";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors } from "@/lib/theme";

type Props = {
  onSelectFlow: (href: string) => void;
};

const customerFlows = [
  {
    description: "Purchased today plus carry-forward due, ready for fast collection work.",
    href: "/ledgers/customers/day",
    icon: ReceiptText,
    key: "customers-day",
    meta: "Day sheet",
    title: "Customer Day",
  },
  {
    description: "Date-wise customer bill detail with print-ready customer ledger output.",
    href: "/ledgers/customers/detail",
    icon: FileSearch,
    key: "customers-detail",
    meta: "Detail",
    title: "Customer Detail",
  },
  {
    description: "Compact bill and payment history for a selected customer.",
    href: "/ledgers/customers/history",
    icon: Clock3,
    key: "customers-history",
    meta: "History",
    title: "Customer History",
  },
] as const;

const sellerFlows = [
  {
    description: "Selected-date seller chalan sheet with payable totals.",
    href: "/ledgers/sellers/day",
    icon: Wallet,
    key: "sellers-day",
    meta: "Day sheet",
    title: "Seller Day",
  },
  {
    description: "Date-wise seller payout history and net payable trail.",
    href: "/ledgers/sellers/history",
    icon: BookCopy,
    key: "sellers-history",
    meta: "History",
    title: "Seller History",
  },
] as const;

function Section({
  items,
  onSelectFlow,
  title,
}: {
  items: readonly {
    description: string;
    href: string;
    icon: typeof BookCopy;
    key: string;
    meta: string;
    title: string;
  }[];
  onSelectFlow: (href: string) => void;
  title: string;
}) {
  return (
    <SurfaceCard contentStyle={styles.sectionCard}>
      <Text variant="titleMedium">{title}</Text>
      <View style={styles.sectionList}>
        {items.map((item) => (
          <ActionCard
            key={item.key}
            title={item.title}
            description={item.description}
            meta={item.meta}
            icon={item.icon}
            onPress={() => onSelectFlow(item.href)}
          />
        ))}
      </View>
    </SurfaceCard>
  );
}

export function LedgerFlowActionList({ onSelectFlow }: Props) {
  return (
    <View style={styles.stack}>
      <Section title="Customers" items={customerFlows} onSelectFlow={onSelectFlow} />
      <Section title="Sellers" items={sellerFlows} onSelectFlow={onSelectFlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  sectionCard: {
    gap: 12,
  },
  sectionList: {
    gap: 10,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
