import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SelectModalField } from "@/components/forms/SelectModalField";
import { AppSegmentedButtons } from "@/components/ui/AppSegmentedButtons";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { getTodayDateString } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { paymentsRepository } from "@/repositories/paymentsRepository";
import { salesRepository } from "@/repositories/salesRepository";
import type { SelectionOption } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { appColors } from "@/lib/theme";

const PAYMENT_METHODS: SelectionOption[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
];

export default function PaymentModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string; billId?: string }>();
  const initialCustomerId = typeof params.customerId === "string" ? params.customerId : "";
  const initialBillId = typeof params.billId === "string" ? params.billId : "";
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const [mode, setMode] = useState<"specific" | "lump">("specific");
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [billId, setBillId] = useState(initialBillId);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);
  const { data: lookupData } = useRepositoryData(() => salesRepository.getFormLookups(), []);

  const { data: billOptionsData } = useRepositoryData(
    async () => (customerId ? paymentsRepository.getCustomerBillOptions(customerId) : []),
    [customerId]
  );

  const customerOptions = lookupData?.buyers ?? [];
  const billOptions = billOptionsData ?? [];

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!isOnline) {
      ErrorHandler.showWarning("You need connectivity to submit payments.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      ErrorHandler.showWarning("Enter a valid payment amount.");
      return;
    }
    if (mode === "specific" && !billId) {
      ErrorHandler.showWarning("Select a bill for a specific payment.");
      return;
    }
    if (mode === "lump" && !customerId) {
      ErrorHandler.showWarning("Select a customer for a lump sum payment.");
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "specific") {
        await rpcService.submitSpecificBillPayment({
          p_daily_bill_id: billId,
          p_amount: parsedAmount,
          p_payment_method: paymentMethod,
          p_payment_date: paymentDate,
        });
      } else {
        await rpcService.submitLumpSumPayment({
          p_customer_id: customerId,
          p_total_amount: parsedAmount,
          p_payment_method: paymentMethod,
          p_payment_date: paymentDate,
        });
      }

      await performFullSync();
      ErrorHandler.showSuccess("Customer payment recorded.");
      router.back();
    } catch (error) {
      ErrorHandler.handle(error, "Customer payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Record Payment" subtitle="Customer collection" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />
      <AppSegmentedButtons
        value={mode}
        onValueChange={(value) => setMode(value as "specific" | "lump")}
        buttons={[
          { value: "specific", label: "Single bill" },
          { value: "lump", label: "Lump sum" },
        ]}
      />

      <SelectModalField
        label="Customer"
        placeholder="Select customer"
        value={customerOptions.find((option) => option.value === customerId)?.label}
        options={customerOptions}
        disabled={submitting}
        onSelect={(option) => {
          setCustomerId(option.value);
          setBillId("");
        }}
      />

      {mode === "specific" ? (
        <SelectModalField
          label="Bill"
          placeholder="Select bill"
          value={billOptions.find((option) => option.value === billId)?.label}
          options={billOptions}
          disabled={submitting || !customerId}
          onSelect={(option) => setBillId(option.value)}
        />
      ) : null}

      <PaperTextInput
        mode="outlined"
        label="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        disabled={submitting}
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
        label="Payment date"
        placeholder="YYYY-MM-DD"
        value={paymentDate}
        onChangeText={setPaymentDate}
        disabled={submitting}
      />

      <View style={styles.actions}>
        <Text variant="bodySmall" style={styles.helper}>
          Writes are online-only in v1. Local lists remain readable offline.
        </Text>
        <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
          Submit payment
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
