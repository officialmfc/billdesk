import { getLocalDataSnapshot, getUserDisplay } from "./shared";
import type {
  ManagedProductRow,
  ManagedStockBatchRow,
  ManagedStockOverview,
  ManagedStaffRow,
  ManagedUserRow,
  SelectionOption,
  UsersOverview,
} from "./types";

function matchesQuery(parts: Array<string | null | undefined>, query: string): boolean {
  if (!query) {
    return true;
  }

  return parts.some((value) => value?.toLowerCase().includes(query));
}

function toSelectionOption(
  value: string,
  label: string,
  description?: string | null,
  meta?: string | null
): SelectionOption {
  return {
    value,
    label,
    description: description || null,
    meta: meta || null,
  };
}

export const adminRepository = {
  async getUsers(search = ""): Promise<UsersOverview> {
    const { users, mfcStaff } = await getLocalDataSnapshot();
    const query = search.trim().toLowerCase();

    const managedUsers: ManagedUserRow[] = users
      .filter((user) =>
        matchesQuery(
          [user.name, user.business_name, user.phone, user.default_role, user.user_type],
          query
        )
      )
      .map((user) => {
        const display = getUserDisplay(user);
        return {
          authUserId: user.auth_user_id,
          businessName: display.businessName,
          displayName: display.businessName || display.name,
          id: user.id,
          isActive: user.is_active,
          name: display.name,
          phone: user.phone,
          updatedAt: user.updated_at,
          userType: user.user_type as "business" | "vendor",
          defaultRole: user.default_role as "buyer" | "seller",
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    const staff: ManagedStaffRow[] = mfcStaff
      .filter((member) => matchesQuery([member.full_name, member.role], query))
      .map((member) => ({
        displayName: member.full_name,
        id: member.id,
        isActive: member.is_active,
        role: member.role,
        updatedAt: member.updated_at,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      staff,
      users: managedUsers,
    };
  },

  async getProducts(search = ""): Promise<ManagedProductRow[]> {
    const { products } = await getLocalDataSnapshot();
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => matchesQuery([product.name, product.description], query))
      .map((product) => ({
        description: product.description,
        id: product.id,
        isStockTracked: product.is_stock_tracked,
        name: product.name,
        updatedAt: product.updated_at,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getStockOverview(search = ""): Promise<ManagedStockOverview> {
    const { mfcStaff, products, stockBatches, users } = await getLocalDataSnapshot();
    const query = search.trim().toLowerCase();
    const sellersById = new Map(
      mfcStaff.filter((member) => member.role === "mfc_seller").map((member) => [member.id, member.full_name])
    );

    const batches: ManagedStockBatchRow[] = stockBatches
      .map((batch) => ({
        batchCode: batch.batch_code,
        costPerKg: batch.cost_per_kg,
        currentWeightKg: batch.current_weight_kg,
        id: batch.id,
        initialWeightKg: batch.initial_weight_kg,
        mfcSellerId: batch.mfc_seller_id,
        mfcSellerName: batch.mfc_seller_id ? sellersById.get(batch.mfc_seller_id) ?? null : null,
        productId: batch.product_id,
        productName: batch.product_name,
        supplierId: batch.supplier_id,
        supplierName: batch.supplier_name,
        updatedAt: batch.updated_at,
      }))
      .filter((batch) =>
        matchesQuery(
          [
            batch.productName,
            batch.batchCode,
            batch.supplierName,
            batch.mfcSellerName,
            batch.id,
          ],
          query
        )
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const productOptions = products
      .map((product) =>
        toSelectionOption(product.id, product.name, product.description, product.is_stock_tracked ? "Tracked" : "Simple")
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    const sellerOptions = mfcStaff
      .filter((member) => member.role === "mfc_seller" && member.is_active)
      .map((member) => toSelectionOption(member.id, member.full_name))
      .sort((a, b) => a.label.localeCompare(b.label));

    const supplierOptions = users
      .filter((user) => user.user_type === "vendor" && user.is_active)
      .map((user) => {
        const display = getUserDisplay(user);
        return toSelectionOption(user.id, display.businessName || display.name, display.name, user.phone);
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      batches,
      products: productOptions,
      sellers: sellerOptions,
      suppliers: supplierOptions,
    };
  },
};
