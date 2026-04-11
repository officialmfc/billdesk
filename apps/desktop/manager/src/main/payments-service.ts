import { buildManagerPaymentsOverview } from "@mfc/manager-ui";
import { buildManagerSpendingsOverview } from "@mfc/manager-workflows";

import type {
  DesktopCustomerPaymentInput,
  DesktopLumpSumPaymentInput,
  DesktopManagerSpendingInput,
  DesktopSellerPayoutInput,
  SelectionOption,
} from "../shared/contracts";

import { getPowerSyncService } from "./powersync";
import { getSupabaseClient } from "./supabase";

type UserRow = {
  business_name: string | null;
  id: string;
  name: string;
};

type BillRow = {
  amount_paid: number;
  bill_date: string;
  bill_number: string;
  customer_id: string;
  id: string;
  status: string;
  total_amount: number;
};

type ChalanRow = {
  amount_paid: number;
  chalan_date: string;
  chalan_number: string;
  commission_amount: number;
  id: string;
  net_payable: number;
  seller_id: string | null;
  status: string;
  total_sale_value: number;
};

type CustomerBalanceRow = {
  current_due: number;
  total_billed: number;
  total_paid: number;
  user_id: string;
};

type SellerBalanceRow = {
  current_due: number;
  total_earned: number;
  total_paid_out: number;
  user_id: string;
};

type CustomerPaymentRow = {
  amount: number;
  daily_bill_id: string;
  id: string;
  payment_date: string;
  payment_method: string;
};

type SellerPaymentRow = {
  amount: number;
  chalan_id: string;
  id: string;
  payment_date: string;
  payment_method: string;
};

type ManagerSpendingRow = {
  amount: number;
  category: string;
  created_by: string | null;
  id: string;
  note: string | null;
  payment_method: string;
  spent_date: string;
  title: string;
};

type StaffRow = {
  full_name: string;
  id: string;
  is_active: number;
  role: string | null;
};

async function refreshReadModel(): Promise<void> {
  try {
    await getPowerSyncService().refresh();
  } catch (error) {
    console.warn("[desktop-manager] PowerSync refresh after payment write failed", error);
  }
}

export async function getPaymentsOverview(search = "") {
  const powerSync = getPowerSyncService();
  const [
    users,
    bills,
    chalans,
    customerBalances,
    sellerBalances,
    customerPayments,
    sellerPayments,
  ] = await Promise.all([
    powerSync.getAll<UserRow>(
      "SELECT id, name, business_name FROM users WHERE is_active = 1 ORDER BY COALESCE(business_name, name)"
    ),
    powerSync.getAll<BillRow>(
      "SELECT id, bill_number, customer_id, bill_date, total_amount, amount_paid, status FROM daily_bills ORDER BY bill_date DESC"
    ),
    powerSync.getAll<ChalanRow>(
      "SELECT id, chalan_number, seller_id, chalan_date, total_sale_value, commission_amount, net_payable, amount_paid, status FROM chalans ORDER BY chalan_date DESC"
    ),
    powerSync.getAll<CustomerBalanceRow>(
      "SELECT user_id, total_billed, total_paid, current_due FROM customer_balance"
    ),
    powerSync.getAll<SellerBalanceRow>(
      "SELECT user_id, total_earned, total_paid_out, current_due FROM seller_balance"
    ),
    powerSync.getAll<CustomerPaymentRow>(
      "SELECT id, daily_bill_id, payment_date, amount, payment_method FROM customer_payments ORDER BY payment_date DESC"
    ),
    powerSync.getAll<SellerPaymentRow>(
      "SELECT id, chalan_id, payment_date, amount, payment_method FROM seller_payments ORDER BY payment_date DESC"
    ),
  ]);

  return buildManagerPaymentsOverview(search, {
    bills,
    chalans,
    customerBalances,
    customerPayments,
    sellerBalances,
    sellerPayments,
    users,
  });
}

export async function getSpendingsOverview(date?: string, search = "") {
  const powerSync = getPowerSyncService();
  const [spendings, staff] = await Promise.all([
    powerSync.getAll<ManagerSpendingRow>(
      `SELECT id, spent_date, title, category, amount, note, payment_method, created_by
       FROM manager_spendings
       ${date ? "WHERE spent_date = ?" : ""}
       ORDER BY spent_date DESC, id DESC`,
      date ? [date] : []
    ),
    powerSync.getAll<StaffRow>(
      "SELECT id, full_name, role, is_active FROM mfc_staff WHERE is_active = 1 ORDER BY full_name ASC"
    ),
  ]);

  return buildManagerSpendingsOverview(
    {
      spendings,
      staff,
    },
    {
      date,
      search,
    }
  );
}

export async function getCustomerBillOptions(customerId: string): Promise<SelectionOption[]> {
  const powerSync = getPowerSyncService();
  const bills = await powerSync.getAll<BillRow>(
    `SELECT id, bill_number, customer_id, bill_date, total_amount, amount_paid, status
     FROM daily_bills
     WHERE customer_id = ?
     ORDER BY bill_date ASC`,
    [customerId]
  );

  return bills
    .filter((bill) => bill.status !== "paid")
    .map((bill) => ({
      value: bill.id,
      label: bill.bill_number,
      description: bill.bill_date,
      meta: String(Math.max(Number(bill.total_amount) - Number(bill.amount_paid), 0)),
    }));
}

export async function getSellerChalanOptions(sellerId: string): Promise<SelectionOption[]> {
  const powerSync = getPowerSyncService();
  const chalans = await powerSync.getAll<ChalanRow>(
    `SELECT id, chalan_number, seller_id, chalan_date, total_sale_value, commission_amount, net_payable, amount_paid, status
     FROM chalans
     WHERE seller_id = ?
     ORDER BY chalan_date ASC`,
    [sellerId]
  );

  return chalans
    .filter((chalan) => chalan.status !== "paid")
    .map((chalan) => ({
      value: chalan.id,
      label: chalan.chalan_number,
      description: chalan.chalan_date,
      meta: String(Math.max(Number(chalan.net_payable) - Number(chalan.amount_paid), 0)),
    }));
}

export async function submitSpecificBillPayment(
  input: DesktopCustomerPaymentInput
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("submit_specific_bill_payment", {
    p_daily_bill_id: input.billId,
    p_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_payment_date: input.paymentDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as { error?: string; success?: boolean } | null;
  if (result?.error) {
    throw new Error(result.error);
  }

  await refreshReadModel();
}

export async function submitLumpSumPayment(
  input: DesktopLumpSumPaymentInput
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("submit_lump_sum_payment", {
    p_customer_id: input.customerId,
    p_total_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_payment_date: input.paymentDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as { error?: string; success?: boolean } | null;
  if (result?.error) {
    throw new Error(result.error);
  }

  await refreshReadModel();
}

export async function submitSellerPayout(
  input: DesktopSellerPayoutInput
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("submit_seller_payout", {
    p_chalan_id: input.chalanId,
    p_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_payment_date: input.paymentDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
}

export async function createManagerSpending(
  input: DesktopManagerSpendingInput
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("create_manager_spending", {
    p_title: input.title,
    p_category: input.category,
    p_amount: input.amount,
    p_note: input.note ?? null,
    p_payment_method: input.paymentMethod,
    p_spent_date: input.spentDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
}
