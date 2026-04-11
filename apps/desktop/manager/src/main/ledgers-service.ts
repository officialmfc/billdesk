import {
  buildCustomerHistoryRows,
  buildCustomerLedgerSearchUsers,
  buildCustomerPurchaseRows,
  buildDayCustomerLedgerSections,
  buildDaySellerLedgerRows,
  buildSellerHistoryRows,
  buildSellerLedgerSearchUsers,
  getCustomerBillDetail,
  getCustomerLedgerSummary,
  getSellerLedgerSummary,
  type ManagerLedgersReadModel,
} from "@mfc/manager-workflows";

import type {
  DesktopCustomerBillPage,
  DesktopCustomerDayLedgerSections,
  DesktopCustomerLedgerDetailPage,
  DesktopCustomerLedgerHistoryPage,
  DesktopSellerDayLedgerRow,
  DesktopSellerLedgerHistoryPage,
} from "../shared/contracts";
import { getPowerSyncService } from "./powersync";

type UserRow = {
  business_name: string | null;
  id: string;
  is_active: number;
  name: string;
  phone: string | null;
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
  mfc_seller_id: string | null;
  net_payable: number;
  seller_id: string | null;
  status: string;
  total_sale_value: number;
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

type SaleTransactionRow = {
  amount: number;
  chalan_id: string | null;
  daily_bill_id: string;
  id: string;
  price_per_kg: number;
  product_description: string | null;
  weight_kg: number;
};

type CustomerBalanceRow = {
  current_due: number;
  total_billed: number;
  total_paid: number;
  updated_at: string | null;
  user_id: string;
};

type SellerBalanceRow = {
  current_due: number;
  total_earned: number;
  total_paid_out: number;
  updated_at: string | null;
  user_id: string;
};

async function getLedgerModel(): Promise<ManagerLedgersReadModel> {
  const powerSync = getPowerSyncService();
  const [users, bills, chalans, customerPayments, sellerPayments, saleTransactions, customerBalances, sellerBalances] =
    await Promise.all([
      powerSync.getAll<UserRow>(
        "SELECT id, name, business_name, phone, is_active FROM users ORDER BY COALESCE(business_name, name)"
      ),
      powerSync.getAll<BillRow>(
        "SELECT id, bill_number, customer_id, bill_date, total_amount, amount_paid, status FROM daily_bills ORDER BY bill_date DESC, bill_number DESC"
      ),
      powerSync.getAll<ChalanRow>(
        "SELECT id, chalan_number, seller_id, mfc_seller_id, chalan_date, total_sale_value, commission_amount, net_payable, amount_paid, status FROM chalans ORDER BY chalan_date DESC, chalan_number DESC"
      ),
      powerSync.getAll<CustomerPaymentRow>(
        "SELECT id, daily_bill_id, payment_date, amount, payment_method FROM customer_payments ORDER BY payment_date DESC"
      ),
      powerSync.getAll<SellerPaymentRow>(
        "SELECT id, chalan_id, payment_date, amount, payment_method FROM seller_payments ORDER BY payment_date DESC"
      ),
      powerSync.getAll<SaleTransactionRow>(
        "SELECT id, daily_bill_id, chalan_id, product_description, weight_kg, price_per_kg, amount FROM sale_transactions"
      ),
      powerSync.getAll<CustomerBalanceRow>(
        "SELECT user_id, total_billed, total_paid, current_due, updated_at FROM customer_balance"
      ),
      powerSync.getAll<SellerBalanceRow>(
        "SELECT user_id, total_earned, total_paid_out, current_due, updated_at FROM seller_balance"
      ),
    ]);

  return {
    bills,
    chalans,
    customerBalances,
    customerPayments,
    saleTransactions: saleTransactions.map((row) => ({
      ...row,
      chalan_id: row.chalan_id ?? "",
    })),
    sellerBalances,
    sellerPayments,
    users: users.map((user) => ({
      ...user,
      is_active: Boolean(user.is_active),
    })),
  };
}

export async function getCustomerDayLedger(dateStr: string): Promise<DesktopCustomerDayLedgerSections> {
  return buildDayCustomerLedgerSections(await getLedgerModel(), dateStr);
}

export async function getSellerDayLedger(dateStr: string): Promise<DesktopSellerDayLedgerRow[]> {
  return buildDaySellerLedgerRows(await getLedgerModel(), dateStr);
}

export async function getCustomerLedgerDetailPage(userId: string): Promise<DesktopCustomerLedgerDetailPage> {
  const model = await getLedgerModel();
  return {
    purchaseRows: userId ? buildCustomerPurchaseRows(model, userId) : [],
    searchUsers: buildCustomerLedgerSearchUsers(model),
    summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
  };
}

export async function getCustomerLedgerHistoryPage(userId: string): Promise<DesktopCustomerLedgerHistoryPage> {
  const model = await getLedgerModel();
  return {
    historyRows: userId ? buildCustomerHistoryRows(model, userId) : [],
    searchUsers: buildCustomerLedgerSearchUsers(model),
    summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
  };
}

export async function getSellerLedgerHistoryPage(userId: string): Promise<DesktopSellerLedgerHistoryPage> {
  const model = await getLedgerModel();
  return {
    historyRows: userId ? buildSellerHistoryRows(model, userId) : [],
    searchUsers: buildSellerLedgerSearchUsers(model),
    summary: userId ? getSellerLedgerSummary(model, userId) : undefined,
  };
}

export async function getCustomerBillPage(userId: string, billId: string): Promise<DesktopCustomerBillPage> {
  const model = await getLedgerModel();
  return {
    bill: userId && billId ? getCustomerBillDetail(model, userId, billId) : null,
    searchUsers: buildCustomerLedgerSearchUsers(model),
    summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
  };
}
