import { buildManagerOperationsSummary } from "@mfc/manager-ui";

import { getPowerSyncService } from "./powersync";

type UserRow = {
  business_name: string | null;
  id: string;
  name: string;
  phone: string | null;
};

type StaffRow = {
  full_name: string;
  id: string;
  is_active: number;
  role: string;
};

type BillRow = {
  amount_paid: number;
  bill_date: string;
  bill_number: string;
  buyer_name?: string | null;
  customer_id: string;
  id: string;
  status: string;
  total_amount: number;
};

type CustomerPaymentRow = {
  amount: number;
  daily_bill_id: string;
  id: string;
  payment_date: string;
  payment_method: string;
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
  seller_name?: string | null;
  status: string;
  total_sale_value: number;
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
  chalan_id: string;
  daily_bill_id: string;
  id: string;
  price_per_kg: number;
  product_description: string | null;
  weight_kg: number;
};

export async function getOperationsSummary(dateStr: string) {
  const powerSync = getPowerSyncService();
  const [users, staff, bills, customerPayments, chalans, sellerPayments, saleTransactions] =
    await Promise.all([
      powerSync.getAll<UserRow>(
        "SELECT id, name, business_name, phone FROM users WHERE is_active = 1 ORDER BY COALESCE(business_name, name)"
      ),
      powerSync.getAll<StaffRow>(
        "SELECT id, full_name, role, is_active FROM mfc_staff WHERE is_active = 1 ORDER BY full_name"
      ),
      powerSync.getAll<BillRow>(
        "SELECT id, bill_number, customer_id, bill_date, total_amount, amount_paid, status FROM daily_bills WHERE bill_date <= ? ORDER BY bill_date DESC",
        [dateStr]
      ),
      powerSync.getAll<CustomerPaymentRow>(
        "SELECT id, daily_bill_id, payment_date, amount, payment_method FROM customer_payments WHERE payment_date <= ? ORDER BY payment_date DESC",
        [dateStr]
      ),
      powerSync.getAll<ChalanRow>(
        "SELECT id, chalan_number, seller_id, mfc_seller_id, chalan_date, total_sale_value, commission_amount, net_payable, amount_paid, status FROM chalans WHERE chalan_date = ? ORDER BY chalan_number ASC",
        [dateStr]
      ),
      powerSync.getAll<SellerPaymentRow>(
        "SELECT id, chalan_id, payment_date, amount, payment_method FROM seller_payments WHERE payment_date = ? ORDER BY payment_date DESC",
        [dateStr]
      ),
      powerSync.getAll<SaleTransactionRow>(
        "SELECT id, daily_bill_id, chalan_id, product_description, weight_kg, price_per_kg, amount FROM sale_transactions"
      ),
    ]);

  return buildManagerOperationsSummary(dateStr, {
    bills,
    chalans,
    customerPayments,
    saleTransactions,
    sellerPayments,
    staff,
    users,
  });
}
