import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SelectModalField } from "@/components/forms/SelectModalField";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useSync } from "@/contexts/SyncContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { ErrorHandler } from "@/lib/error-handler";
import { getTodayDateString } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import type { SelectionOption } from "@/repositories/types";
import { appColors } from "@/lib/theme";

const CATEGORY_OPTIONS: SelectionOption[] = [
  { value: "tea-snacks", label: "Tea snacks" },
  { value: "transport", label: "Transport" },
  { value: "loading", label: "Loading" },
  { value: "packing", label: "Packing" },
  { value: "utilities", label: "Utilities" },
  { value: "misc", label: "Misc" },
];

const PAYMENT_METHODS: SelectionOption[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "check", label: "Check" },
];

export default function SpendingModal() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [spentDate, setSpentDate] = useState(getTodayDateString());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!isOnline) {
      ErrorHandler.showWarning("You need connectivity to save spendings.");
      return;
    }
    if (!title.trim()) {
      ErrorHandler.showWarning("Add a spending title.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      ErrorHandler.showWarning("Enter a valid spending amount.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.createManagerSpending({
        p_title: title.trim(),
        p_category: category,
        p_amount: parsedAmount,
        p_note: note.trim() || null,
        p_payment_method: paymentMethod,
        p_spent_date: spentDate,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Spending recorded.");
      router.back();
    } catch (error) {
      ErrorHandler.handle(error, "Manager spending");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Add Spending" subtitle="Manager-side operational spend" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />

      <PaperTextInput
        mode="outlined"
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Tea, fuel, labour, transport..."
        disabled={submitting}
      />
      <PaperTextInput
        mode="outlined"
        label="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        disabled={submitting}
      />
      <SelectModalField
        label="Category"
        placeholder="Select category"
        value={CATEGORY_OPTIONS.find((option) => option.value === category)?.label}
        options={CATEGORY_OPTIONS}
        disabled={submitting}
        onSelect={(option) => setCategory(option.value)}
      />
      <SelectModalField
        label="Payment method"
        placeholder="Select payment method"
        value={PAYMENT_METHODS.find((option) => option.value === paymentMethod)?.label}
        options={PAYMENT_METHODS}
        disabled={submitting}
        onSelect={(option) => setPaymentMethod(option.value)}
      />
      <PaperTextInput
        mode="outlined"
        label="Spent date"
        placeholder="YYYY-MM-DD"
        value={spentDate}
        onChangeText={setSpentDate}
        disabled={submitting}
      />
      <PaperTextInput
        mode="outlined"
        label="Note"
        placeholder="Optional internal note"
        multiline
        numberOfLines={4}
        value={note}
        onChangeText={setNote}
        disabled={submitting}
      />

      <View style={styles.actions}>
        <Text variant="bodySmall" style={styles.helper}>
          Spendings write online in v1. Lists remain readable from local sync.
        </Text>
        <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
          Save spending
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  helper: {
    color: appColors.mutedForeground,
  },
});
