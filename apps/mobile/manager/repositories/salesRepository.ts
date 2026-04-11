import { getLocalDataSnapshot } from "./shared";
import type { SaleFormLookups } from "./types";

function formatUserOptionLabel(user: { name: string | null; business_name: string | null }) {
  const name = user.name?.trim() ?? "";
  const businessName = user.business_name?.trim() ?? "";

  if (businessName && name && businessName !== name) {
    return `${businessName} (${name})`;
  }

  return businessName || name;
}

function mapUserOption(user: {
  id: string;
  name: string | null;
  business_name: string | null;
  phone: string | null;
}) {
  return {
    value: user.id,
    label: formatUserOptionLabel(user),
    description: null,
    meta: user.phone,
  };
}

export const salesRepository = {
  async getFormLookups(): Promise<SaleFormLookups> {
    const { users, mfcStaff, products, stockBatches } = await getLocalDataSnapshot();
    const userOptions = users
      .filter((user) => user.is_active)
      .map(mapUserOption)
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      userOptions,
      auctionSellers: userOptions,
      buyers: userOptions,
      vendors: users
        .filter((user) => user.user_type === "vendor" && user.is_active)
        .map(mapUserOption)
        .sort((a, b) => a.label.localeCompare(b.label)),
      mfcSellers: mfcStaff
        .filter((staff) => staff.role === "mfc_seller" && staff.is_active)
        .map((staff) => ({
          value: staff.id,
          label: staff.full_name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      products: products
        .map((product) => ({
          value: product.id,
          label: product.name,
          description: product.description,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      stockBatches: stockBatches
        .filter((batch) => Number(batch.current_weight_kg) > 0)
        .map((batch) => ({
          value: batch.id,
          label: batch.batch_code || batch.product_name || "Stock batch",
          description: batch.product_name,
          meta: `${Number(batch.current_weight_kg).toFixed(2)} kg available`,
          productId: batch.product_id,
          productName: batch.product_name ?? null,
          currentWeightKg: Number(batch.current_weight_kg),
          mfcSellerId: batch.mfc_seller_id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  },
};
