import { buildManagerPaymentsOverview } from "@mfc/manager-ui";
import { buildManagerSpendingsOverview } from "@mfc/manager-workflows";

import { getLocalDataSnapshot } from "./shared";
import type {
  PaymentsOverview,
  SelectionOption,
  SpendingsOverview,
} from "./types";

export const paymentsRepository = {
  async getPaymentsOverview(search = ""): Promise<PaymentsOverview> {
    const {
      users,
      customerBalances,
      sellerBalances,
      dailyBills,
      chalans,
      customerPayments,
      sellerPayments,
    } = await getLocalDataSnapshot();
    return buildManagerPaymentsOverview(search, {
      bills: dailyBills,
      chalans,
      customerBalances,
      customerPayments,
      sellerBalances,
      sellerPayments,
      users,
    });
  },

  async getCustomerBillOptions(customerId: string): Promise<SelectionOption[]> {
    const { dailyBills } = await getLocalDataSnapshot();

    return dailyBills
      .filter((bill) => bill.customer_id === customerId && bill.status !== "paid")
      .sort((a, b) => a.bill_date.localeCompare(b.bill_date))
      .map((bill) => ({
        value: bill.id,
        label: bill.bill_number,
        description: bill.bill_date,
        meta: `${Math.max(Number(bill.total_amount) - Number(bill.amount_paid), 0)}`,
      }));
  },

  async getSellerChalanOptions(sellerId: string): Promise<SelectionOption[]> {
    const { chalans } = await getLocalDataSnapshot();

    return chalans
      .filter((chalan) => chalan.seller_id === sellerId && chalan.status !== "paid")
      .sort((a, b) => a.chalan_date.localeCompare(b.chalan_date))
      .map((chalan) => ({
        value: chalan.id,
        label: chalan.chalan_number,
        description: chalan.chalan_date,
        meta: `${Math.max(Number(chalan.net_payable) - Number(chalan.amount_paid), 0)}`,
      }));
  },

  async getSpendingsOverview(date?: string, search = ""): Promise<SpendingsOverview> {
    const { managerSpendings, mfcStaff } = await getLocalDataSnapshot();

    return buildManagerSpendingsOverview(
      {
        spendings: managerSpendings,
        staff: mfcStaff.map((member) => ({
          id: member.id,
          full_name: member.full_name,
          is_active: member.is_active,
          role: member.role,
        })),
      },
      {
        date,
        search,
      }
    );
  },
};
