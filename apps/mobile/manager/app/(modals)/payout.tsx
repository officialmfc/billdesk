import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SelectModalField } from "@/components/forms/SelectModalField";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { getTodayDateString } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { paymentsRepository } from "@/repositories/paymentsRepository";
import type { SelectionOption } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { appColors } from "@/lib/theme";

const PAYMENT_METHODS: SelectionOption[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
];

export default function PayoutModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sellerId?: string; chalanId?: string }>();
  const initialSellerId = typeof params.sellerId === "string" ? params.sellerId : "";
  const initialChalanId = typeof params.chalanId === "string" ? params.chalanId : "";
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const [sellerId, setSellerId] = useState(initialSellerId);
  const [chalanId, setChalanId] = useState(initialChalanId);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);
  const { data } = useRepositoryData(() => paymentsRepository.getPaymentsOverview(), []);

  const sellerOptions: SelectionOption[] =
    data?.sellerAccounts.map((account) => ({
      value: account.userId,
      label: account.businessName || account.name,
      description: `${account.openItemCount} open chalans`,
      meta: account.totalDue.toFixed(0),
    })) ?? [];

  const { data: chalanOptionsData } = useRepositoryData(
    async () => (sellerId ? paymentsRepository.getSellerChalanOptions(sellerId) : []),
    [sellerId]
  );
  const chalanOptions = chalanOptionsData ?? [];

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!isOnline) {
      ErrorHandler.showWarning("You need connectivity to submit payouts.");
      return;
    }
    if (!sellerId || !chalanId) {
      ErrorHandler.showWarning("Select a seller and chalan.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      ErrorHandler.showWarning("Enter a valid payout amount.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.submitSellerPayout({
        p_chalan_id: chalanId,
        p_amount: parsedAmount,
        p_payment_method: paymentMethod,
        p_payment_date: paymentDate,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Seller payout recorded.");
      router.back();
    } catch (error) {
      ErrorHandler.handle(error, "Seller payout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Record Payout" subtitle="Seller settlement" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />

      <SelectModalField
        label="Seller"
        placeholder="Select seller"
        value={sellerOptions.find((option) => option.value === sellerId)?.label}
        options={sellerOptions}
        disabled={submitting}
        onSelect={(option) => {
          setSellerId(option.value);
          setChalanId("");
        }}
      />
      <SelectModalField
        label="Chalan"
        placeholder="Select chalan"
        value={chalanOptions.find((option) => option.value === chalanId)?.label}
        options={chalanOptions}
        disabled={submitting || !sellerId}
        onSelect={(option) => setChalanId(option.value)}
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
          Payouts require a live Supabase round trip in v1.
        </Text>
        <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
          Submit payout
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
