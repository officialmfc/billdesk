export {
  buildCustomerHistoryRows,
  buildCustomerLedgerSearchUsers,
  buildCustomerLedgerSummaries,
  buildCustomerPaymentRows,
  buildCustomerPurchaseRows,
  buildDayCustomerLedgerRows,
  buildDayCustomerLedgerSections,
  buildDaySellerLedgerRows,
  buildSellerHistoryRows,
  buildSellerLedgerSearchUsers,
  buildSellerLedgerSummaries,
  getCustomerLedgerSummary,
  getCustomerBillDetail,
  getSellerLedgerSummary,
  type CustomerBillDetailRow,
  type CustomerBillDetailView,
  type CustomerLedgerHistoryRow,
  type CustomerLedgerPaymentRow,
  type CustomerLedgerPurchaseRow,
  type DayCustomerLedgerRow,
  type DayCustomerLedgerSections,
  type DayLedgerDueEntry,
  type DaySellerLedgerRow,
  type LedgerSearchUser,
  type LedgerSummaryEntry,
  type LedgerTab,
  type SellerLedgerHistoryRow,
} from "@mfc/manager-workflows";

import type { WebLedgersReadModel } from "@/lib/web-remote-read-model";

export type { WebLedgersReadModel };

export const emptyWebLedgersReadModel: WebLedgersReadModel = {
  bills: [],
  chalans: [],
  customerBalances: [],
  customerPayments: [],
  managerSpendings: [],
  mfcStaff: [],
  saleTransactions: [],
  sellerBalances: [],
  sellerPayments: [],
  users: [],
};
