import type {
  DesktopProductRecord,
  DesktopQuoteCreateInput,
  DesktopQuoteRecord,
  DesktopQuotesOverview,
  DesktopUserRecord,
  SelectionOption,
} from "../shared/contracts";
import { getPowerSyncService } from "./powersync";
import { getSupabaseClient } from "./supabase";

type UserRow = {
  auth_user_id: string | null;
  business_name: string | null;
  default_role: "buyer" | "seller";
  id: string;
  is_active: number | boolean;
  name: string;
  phone: string | null;
  updated_at: string;
  user_type: "vendor" | "business";
};

type StaffRow = {
  full_name: string;
  id: string;
};

type ProductRow = {
  description: string | null;
  id: string;
  is_stock_tracked: number | boolean;
  name: string;
  updated_at: string;
};

type QuoteRow = {
  advance_paid: number;
  assigned_mfc_seller_id: string | null;
  created_at?: string | null;
  customer_id: string;
  delivery_date: string;
  id: string;
  notes: string | null;
  quote_number: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total_amount: number;
  updated_at: string;
};

function asBoolean(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function formatUserLabel(user: Pick<UserRow, "name" | "business_name">): string {
  const businessName = user.business_name?.trim() ?? "";
  const name = user.name?.trim() ?? "";

  if (businessName && name && businessName !== name) {
    return `${businessName} (${name})`;
  }

  return businessName || name;
}

function toUserRecord(row: UserRow): DesktopUserRecord {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    businessName: row.business_name,
    phone: row.phone,
    userType: row.user_type,
    defaultRole: row.default_role,
    isActive: asBoolean(row.is_active),
    updatedAt: row.updated_at,
  };
}

function toProductRecord(row: ProductRow): DesktopProductRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isStockTracked: asBoolean(row.is_stock_tracked),
    updatedAt: row.updated_at,
  };
}

async function refreshReadModel(): Promise<void> {
  try {
    await getPowerSyncService().refresh();
  } catch (error) {
    console.warn("[desktop-manager] PowerSync refresh after quote write failed", error);
  }
}

export async function getQuotesOverview(): Promise<DesktopQuotesOverview> {
  const powerSync = getPowerSyncService();
  const [customerRows, staffRows, productRows, quoteRows] = await Promise.all([
    powerSync.getAll<UserRow>(
      "SELECT id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at FROM users WHERE is_active = 1 AND default_role = 'buyer' ORDER BY COALESCE(business_name, name)"
    ),
    powerSync.getAll<StaffRow>(
      "SELECT id, full_name FROM mfc_staff WHERE is_active = 1 AND role = 'mfc_seller' ORDER BY full_name"
    ),
    powerSync.getAll<ProductRow>(
      "SELECT id, name, description, is_stock_tracked, updated_at FROM products ORDER BY name"
    ),
    powerSync.getAll<QuoteRow>(
      "SELECT id, quote_number, customer_id, assigned_mfc_seller_id, delivery_date, total_amount, advance_paid, status, notes, updated_at FROM quotes ORDER BY delivery_date DESC, updated_at DESC"
    ),
  ]);

  const customers = customerRows.map(toUserRecord);
  const customersById = new Map(customers.map((row) => [row.id, row]));
  const sellersById = new Map(staffRows.map((row) => [row.id, row.full_name]));

  return {
    customers,
    sellers: staffRows.map(
      (row): SelectionOption => ({
        value: row.id,
        label: row.full_name,
      })
    ),
    products: productRows.map(toProductRecord),
    quotes: quoteRows.map(
      (row): DesktopQuoteRecord => ({
        id: row.id,
        quoteNumber: row.quote_number,
        customerId: row.customer_id,
        customerName:
          customersById.get(row.customer_id)?.businessName ||
          customersById.get(row.customer_id)?.name ||
          "Unknown",
        assignedMfcSellerId: row.assigned_mfc_seller_id,
        sellerName: row.assigned_mfc_seller_id
          ? sellersById.get(row.assigned_mfc_seller_id) || null
          : null,
        deliveryDate: row.delivery_date,
        totalAmount: Number(row.total_amount),
        advancePaid: Number(row.advance_paid),
        status: row.status,
        notes: row.notes,
        updatedAt: row.updated_at,
        createdAt: row.created_at ?? null,
      })
    ),
  };
}

export async function createQuote(input: DesktopQuoteCreateInput): Promise<string> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("create_quote", {
    p_customer_id: input.customerId,
    p_assigned_mfc_seller_id: input.assignedMfcSellerId,
    p_delivery_date: input.deliveryDate,
    p_quote_number: input.quoteNumber,
    p_items: input.items
      .map((item) => ({
        product_id: item.productId || null,
        product_description: item.productDescription.trim(),
        weight_kg: Number(item.weightKg),
        price_per_kg: Number(item.pricePerKg),
      }))
      .filter(
        (item) => item.product_description && item.weight_kg > 0 && item.price_per_kg > 0
      ),
    p_notes: input.notes?.trim() || "",
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
  return input.quoteNumber;
}
