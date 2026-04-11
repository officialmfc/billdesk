import type {
  AuctionSaleItemInput,
  BatchSaleItemInput,
  DirectSaleItemInput,
  FloorSaleItemInput,
  SaleFormLookups,
  SelectionOption,
  StockBatchOption,
} from "../shared/contracts";
import { getPowerSyncService } from "./powersync";
import { getSupabaseClient } from "./supabase";

function formatUserOptionLabel(user: { name: string; business_name: string | null }) {
  const name = user.name?.trim() ?? "";
  const businessName = user.business_name?.trim() ?? "";

  if (businessName && name && businessName !== name) {
    return `${businessName} (${name})`;
  }

  return businessName || name;
}

async function refreshReadModel(): Promise<void> {
  try {
    await getPowerSyncService().refresh();
  } catch (error) {
    console.warn("[desktop-manager] PowerSync refresh after write failed", error);
  }
}

type UserRow = {
  id: string;
  name: string;
  business_name: string | null;
  phone: string | null;
  user_type: "vendor" | "business";
};

type StaffRow = {
  id: string;
  full_name: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
};

type StockBatchRow = {
  id: string;
  batch_code: string | null;
  product_id: string;
  product_name: string | null;
  current_weight_kg: number;
  mfc_seller_id: string | null;
};

function toUserOption(user: UserRow): SelectionOption {
  return {
    value: user.id,
    label: formatUserOptionLabel(user),
    meta: user.phone,
  };
}

export async function getSaleFormLookups(): Promise<SaleFormLookups> {
  const powerSync = getPowerSyncService();
  const [users, staff, products, stockBatches] = await Promise.all([
    powerSync.getAll<UserRow>(
      "SELECT id, name, business_name, phone, user_type FROM users WHERE is_active = 1 ORDER BY COALESCE(business_name, name)"
    ),
    powerSync.getAll<StaffRow>(
      "SELECT id, full_name FROM mfc_staff WHERE is_active = 1 AND role = 'mfc_seller' ORDER BY full_name"
    ),
    powerSync.getAll<ProductRow>(
      "SELECT id, name, description FROM products ORDER BY name"
    ),
    powerSync.getAll<StockBatchRow>(
      `SELECT sb.id, sb.batch_code, sb.product_id, p.name as product_name, sb.current_weight_kg, sb.mfc_seller_id
       FROM stock_batches sb
       LEFT JOIN products p ON p.id = sb.product_id
       WHERE sb.current_weight_kg > 0
       ORDER BY COALESCE(sb.batch_code, p.name, 'Stock batch')`
    ),
  ]);

  const userOptions = users.map(toUserOption);

  return {
    userOptions,
    auctionSellers: userOptions,
    buyers: userOptions,
    vendors: users.filter((user) => user.user_type === "vendor").map(toUserOption),
    mfcSellers: staff.map((person) => ({ value: person.id, label: person.full_name })),
    products: products.map((product) => ({
      value: product.id,
      label: product.name,
      description: product.description,
    })),
    stockBatches: stockBatches.map(
      (batch): StockBatchOption => ({
        value: batch.id,
        label: batch.batch_code || batch.product_name || "Stock batch",
        description: batch.product_name,
        meta: `${Number(batch.current_weight_kg).toFixed(2)} kg available`,
        productId: batch.product_id,
        productName: batch.product_name,
        currentWeightKg: Number(batch.current_weight_kg),
        mfcSellerId: batch.mfc_seller_id,
      })
    ),
  };
}

export async function createAuctionSale(input: {
  sellerId: string;
  commissionPercentage: number;
  paidAmount?: number;
  saleDate: string;
  items: AuctionSaleItemInput[];
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_auction_sale", {
    p_seller_id: input.sellerId,
    p_sale_items: input.items,
    p_commission_percentage: input.commissionPercentage,
    p_paid_amount: input.paidAmount,
    p_chalan_date: input.saleDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
  return data as string;
}

export async function createDirectSale(input: {
  buyerId: string;
  saleDate: string;
  items: DirectSaleItemInput[];
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_sale_for_single_customer", {
    p_buyer_id: input.buyerId,
    p_sale_items: input.items,
    p_sale_date: input.saleDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  const billId = data as string;
  const { data: billData } = await supabase
    .from("daily_bills")
    .select("bill_number")
    .eq("id", billId)
    .single();

  await refreshReadModel();
  return billData?.bill_number || billId;
}

export async function createBatchSale(input: {
  mfcSellerId: string;
  saleDate: string;
  items: BatchSaleItemInput[];
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_seller_batch_sale", {
    p_mfc_seller_id: input.mfcSellerId,
    p_sale_items: input.items,
    p_sale_date: input.saleDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  const chalanId = data as string;
  const { data: chalanData } = await supabase
    .from("chalans")
    .select("chalan_number")
    .eq("id", chalanId)
    .single();

  await refreshReadModel();
  return chalanData?.chalan_number || chalanId;
}

export async function createFloorSale(input: {
  saleDate: string;
  items: FloorSaleItemInput[];
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_floor_sale", {
    p_sale_items: input.items,
    p_sale_date: input.saleDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
  return data as string;
}
