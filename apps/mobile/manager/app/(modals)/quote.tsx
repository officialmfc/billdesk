import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import {
  buildManagerQuoteNumber,
  calculateManagerQuoteTotal,
  prepareManagerQuoteItems,
} from "@mfc/manager-workflows";

import { QuoteItemEditor } from "@/components/forms/QuoteItemEditor";
import { SelectModalField } from "@/components/forms/SelectModalField";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { formatCurrency, getTodayDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { rpcService } from "@/lib/rpc-service";
import { supabase } from "@/lib/supabase";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { quotesRepository } from "@/repositories/quotesRepository";
import type { QuoteItemDraft, SelectionOption } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";

function createQuoteDraft(id: string): QuoteItemDraft {
  return {
    id,
    weightKg: "",
    pricePerKg: "",
  };
}

export default function QuoteModal() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const { data } = useRepositoryData(() => quotesRepository.getQuoteFormLookups(), []);
  const [extraBuyerOptions, setExtraBuyerOptions] = useState<SelectionOption[]>([]);
  const [extraProductOptions, setExtraProductOptions] = useState<SelectionOption[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(getTodayDateString());
  const [quoteNumber, setQuoteNumber] = useState(() => buildManagerQuoteNumber());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItemDraft[]>([createQuoteDraft("item-1")]);
  const [submitting, setSubmitting] = useState(false);
  const [customerCreateOpen, setCustomerCreateOpen] = useState(false);
  const [productCreateOpen, setProductCreateOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [activeProductItemId, setActiveProductItemId] = useState<string | null>(null);
  const [customerDraft, setCustomerDraft] = useState({
    businessName: "",
    fullName: "",
    phone: "",
  });
  const [productDraft, setProductDraft] = useState({
    name: "",
    description: "",
  });
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const buyerOptions = useMemo(() => {
    const merged = [...extraBuyerOptions, ...(data?.buyers ?? [])];
    return Array.from(new Map(merged.map((option) => [option.value, option])).values());
  }, [data?.buyers, extraBuyerOptions]);

  const productOptions = useMemo(() => {
    const merged = [...extraProductOptions, ...(data?.products ?? [])];
    return Array.from(new Map(merged.map((option) => [option.value, option])).values());
  }, [data?.products, extraProductOptions]);

  const totalAmount = useMemo(() => calculateManagerQuoteTotal(items), [items]);

  const updateItem = (id: string, patch: Partial<QuoteItemDraft>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const openCustomerCreate = () => {
    setCustomerError(null);
    setCustomerDraft((current) => ({
      businessName: current.businessName,
      fullName: current.fullName,
      phone: current.phone,
    }));
    setCustomerCreateOpen(true);
  };

  const openProductCreate = (itemId: string, seedName?: string) => {
    setProductError(null);
    setActiveProductItemId(itemId);
    setProductDraft((current) => ({
      name: seedName?.trim() || current.name,
      description: current.description,
    }));
    setProductCreateOpen(true);
  };

  const handleCreateCustomer = async () => {
    const businessName = customerDraft.businessName.trim();
    const fullName = customerDraft.fullName.trim();
    const phone = customerDraft.phone.trim();

    if (businessName.length < 2 || fullName.length < 2 || phone.length < 10) {
      setCustomerError("Business, contact, and phone are required.");
      return;
    }

    try {
      setCreatingCustomer(true);
      setCustomerError(null);
      const userId = await rpcService.createUserAsStaff({
        p_full_name: fullName,
        p_business_name: businessName,
        p_phone: phone,
        p_user_type: "business",
        p_default_role: "buyer",
      });
      const option = {
        value: userId,
        label: businessName,
        description: fullName,
        meta: phone,
      } satisfies SelectionOption;
      setExtraBuyerOptions((current) => [option, ...current]);
      setCustomerId(userId);
      await performFullSync();
      setCustomerCreateOpen(false);
      ErrorHandler.showSuccess("Customer created.");
    } catch (error) {
      ErrorHandler.handle(error, "Create customer");
      setCustomerError(error instanceof Error ? error.message : "Failed to create customer.");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleCreateProduct = async () => {
    const name = productDraft.name.trim();
    if (name.length < 2) {
      setProductError("Product name must be at least 2 characters.");
      return;
    }

    try {
      setCreatingProduct(true);
      setProductError(null);
      const { data: insertedRow, error } = await supabase
        .from("products")
        .insert({
          name,
          description: productDraft.description.trim() || null,
          is_stock_tracked: true,
        })
        .select("id, name, description")
        .single();

      if (error) {
        throw error;
      }

      const option = {
        value: insertedRow.id,
        label: insertedRow.name,
        description: insertedRow.description,
      } satisfies SelectionOption;
      setExtraProductOptions((current) => [option, ...current]);

      if (activeProductItemId) {
        updateItem(activeProductItemId, {
          productId: insertedRow.id,
          productDescription: insertedRow.name,
        });
      }

      await performFullSync();
      setProductCreateOpen(false);
      ErrorHandler.showSuccess("Product created.");
    } catch (error) {
      ErrorHandler.handle(error, "Create product");
      setProductError(error instanceof Error ? error.message : "Failed to create product.");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      ErrorHandler.showWarning("You need connectivity to create a quote.");
      return;
    }
    if (!customerId || !sellerId || !quoteNumber.trim()) {
      ErrorHandler.showWarning("Fill customer, seller, and quote number.");
      return;
    }

    const preparedItems = prepareManagerQuoteItems(items);

    if (!preparedItems.length) {
      ErrorHandler.showWarning("Add at least one valid quote item.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.createQuote({
        p_customer_id: customerId,
        p_assigned_mfc_seller_id: sellerId,
        p_delivery_date: deliveryDate,
        p_quote_number: quoteNumber.trim(),
        p_items: preparedItems as Array<{
          product_id: string | null;
          product_description: string;
          weight_kg: number;
          price_per_kg: number;
        }>,
        p_notes: notes.trim() || undefined,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Quote created.");
      router.back();
    } catch (error) {
      ErrorHandler.handle(error, "Create quote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Create Quote" subtitle="Online quote flow" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />

      <SelectModalField
        label="Customer"
        placeholder="Select customer"
        value={buyerOptions.find((option) => option.value === customerId)?.label}
        options={buyerOptions}
        disabled={submitting}
        searchPlaceholder="Search customer..."
        emptyState={
          <Text variant="bodyMedium" style={styles.mutedText}>
            No matching customer. Create one without leaving this quote.
          </Text>
        }
        createAction={{
          label: "Create customer",
          onPress: openCustomerCreate,
        }}
        onSelect={(option) => setCustomerId(option.value)}
      />
      <SelectModalField
        label="Assigned seller"
        placeholder="Select seller"
        value={data?.mfcSellers.find((option) => option.value === sellerId)?.label}
        options={data?.mfcSellers ?? []}
        disabled={submitting}
        onSelect={(option) => setSellerId(option.value)}
      />
      <PaperTextInput
        mode="outlined"
        label="Delivery date"
        placeholder="YYYY-MM-DD"
        value={deliveryDate}
        onChangeText={setDeliveryDate}
        disabled={submitting}
      />
      <PaperTextInput
        mode="outlined"
        label="Quote number"
        value={quoteNumber}
        onChangeText={setQuoteNumber}
        disabled={submitting}
      />
      <PaperTextInput
        mode="outlined"
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        disabled={submitting}
      />

      {customerCreateOpen ? (
        <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Create Customer</Text>
          <PaperTextInput
            mode="outlined"
            label="Business name"
            value={customerDraft.businessName}
            onChangeText={(value) => setCustomerDraft((current) => ({ ...current, businessName: value }))}
          />
          <PaperTextInput
            mode="outlined"
            label="Contact name"
            value={customerDraft.fullName}
            onChangeText={(value) => setCustomerDraft((current) => ({ ...current, fullName: value }))}
          />
          <PaperTextInput
            mode="outlined"
            label="Phone"
            value={customerDraft.phone}
            onChangeText={(value) => setCustomerDraft((current) => ({ ...current, phone: value }))}
            keyboardType="phone-pad"
          />
          {customerError ? (
            <Text variant="bodySmall" style={styles.errorText}>
              {customerError}
            </Text>
          ) : null}
          <View style={styles.actionRow}>
            <Button mode="text" onPress={() => setCustomerCreateOpen(false)} disabled={creatingCustomer}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreateCustomer} loading={creatingCustomer} disabled={creatingCustomer}>
              Create customer
            </Button>
          </View>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.summaryCard} contentStyle={styles.summaryContent}>
          <Text variant="titleMedium">Quote total</Text>
          <Text variant="headlineSmall">{formatCurrency(totalAmount)}</Text>
      </SurfaceCard>

      <View style={styles.stack}>
        {items.map((item, index) => (
          <QuoteItemEditor
            key={item.id}
            index={index}
            item={item}
            productOptions={productOptions}
            disabled={submitting}
            productEmptyState={
              <Text variant="bodyMedium" style={styles.mutedText}>
                No matching product. Create one and continue this quote.
              </Text>
            }
            productCreateAction={{
              label: "Create product",
              onPress: () => openProductCreate(item.id, item.productDescription),
            }}
            onSelectProduct={(option) =>
              updateItem(item.id, {
                productId: option.value,
                productDescription: option.description || option.label,
              })
            }
            onChange={(patch) => updateItem(item.id, patch)}
            onRemove={() =>
              setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== item.id) : current))
            }
          />
        ))}
      </View>

      {productCreateOpen ? (
        <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Create Product</Text>
          <PaperTextInput
            mode="outlined"
            label="Product name"
            value={productDraft.name}
            onChangeText={(value) => setProductDraft((current) => ({ ...current, name: value }))}
          />
          <PaperTextInput
            mode="outlined"
            label="Description"
            value={productDraft.description}
            onChangeText={(value) => setProductDraft((current) => ({ ...current, description: value }))}
          />
          {productError ? (
            <Text variant="bodySmall" style={styles.errorText}>
              {productError}
            </Text>
          ) : null}
          <View style={styles.actionRow}>
            <Button mode="text" onPress={() => setProductCreateOpen(false)} disabled={creatingProduct}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreateProduct} loading={creatingProduct} disabled={creatingProduct}>
              Create product
            </Button>
          </View>
        </SurfaceCard>
      ) : null}

      <Button
        mode="outlined"
        disabled={submitting}
        onPress={() => setItems((current) => [...current, createQuoteDraft(`item-${current.length + 1}`)])}
      >
        Add item
      </Button>
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
        Create quote
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: appColors.primarySoft,
  },
  summaryContent: {
    gap: 6,
  },
  stack: {
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  errorText: {
    color: appColors.danger,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
