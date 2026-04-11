export type ManagerQuoteItemDraft = {
  id: string;
  productId?: string;
  productDescription?: string;
  weightKg: string | number;
  pricePerKg: string | number;
};

export type ManagerInlineCustomerDraft = {
  businessName: string;
  fullName: string;
  phone: string;
};

export type ManagerInlineProductDraft = {
  name: string;
  description: string;
};

function asNumber(value: number | string | null | undefined): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

export function buildManagerQuoteNumber(now = new Date()): string {
  const stamp = now.toISOString().replaceAll(/[-:TZ.]/g, "").slice(0, 12);
  return `QT-${stamp}`;
}

export function calculateManagerQuoteTotal(
  items: Array<Pick<ManagerQuoteItemDraft, "weightKg" | "pricePerKg">>
): number {
  return items.reduce((sum, item) => {
    return sum + asNumber(item.weightKg) * asNumber(item.pricePerKg);
  }, 0);
}

export function prepareManagerQuoteItems(
  items: Array<Pick<ManagerQuoteItemDraft, "productId" | "productDescription" | "weightKg" | "pricePerKg">>
): Array<{
  price_per_kg: number;
  product_description: string;
  product_id: string | null;
  weight_kg: number;
}> {
  return items
    .map((item) => ({
      product_id: item.productId || null,
      product_description: (item.productDescription ?? "").trim(),
      weight_kg: asNumber(item.weightKg),
      price_per_kg: asNumber(item.pricePerKg),
    }))
    .filter((item) => item.product_description && item.weight_kg > 0 && item.price_per_kg > 0);
}
