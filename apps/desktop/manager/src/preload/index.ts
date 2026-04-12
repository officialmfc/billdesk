import { contextBridge, ipcRenderer } from "electron";

import type {
  AuctionSaleItemInput,
  BatchSaleItemInput,
  DesktopPrintBusinessConfig,
  DesktopProductCreateInput,
  DesktopProductRecord,
  DesktopCustomerBillPage,
  DesktopCustomerDayLedgerSections,
  DesktopCustomerPaymentInput,
  DesktopCustomerLedgerDetailPage,
  DesktopCustomerLedgerHistoryPage,
  DesktopLumpSumPaymentInput,
  DesktopManagerSpendingInput,
  DesktopOperationsSummary,
  DesktopPaymentsOverview,
  DesktopQuoteCreateInput,
  DesktopQuotesOverview,
  DesktopSellerDayLedgerRow,
  DesktopSellerLedgerHistoryPage,
  DesktopSellerPayoutInput,
  DesktopSpendingsOverview,
  DesktopStockBatchCreateInput,
  DesktopStockOverview,
  DesktopUserCreateInput,
  DesktopUserInvitationResult,
  DesktopUserRecord,
  DirectSaleItemInput,
  FloorSaleItemInput,
  SaleFormLookups,
  SelectionOption,
  StaffProfile,
  SyncStatus,
} from "../shared/contracts";

const api = {
  app: {
    getPrintConfig: (): Promise<DesktopPrintBusinessConfig> => ipcRenderer.invoke("app:get-print-config"),
  },
  auth: {
    getState: (): Promise<StaffProfile | null> => ipcRenderer.invoke("auth:get-state"),
    loginWithAuthHub: (): Promise<StaffProfile> => ipcRenderer.invoke("auth:login-hosted"),
    openPasswordReset: (): Promise<boolean> => ipcRenderer.invoke("auth:open-password-reset"),
    logout: (): Promise<boolean> => ipcRenderer.invoke("auth:logout"),
  },
  sync: {
    getStatus: (): Promise<SyncStatus> => ipcRenderer.invoke("sync:get-status"),
    refresh: (): Promise<SyncStatus> => ipcRenderer.invoke("sync:refresh"),
  },
  sales: {
    getLookups: (): Promise<SaleFormLookups> => ipcRenderer.invoke("sales:get-lookups"),
    createAuction: (payload: {
      sellerId: string;
      commissionPercentage: number;
      paidAmount?: number;
      saleDate: string;
      items: AuctionSaleItemInput[];
    }): Promise<string> => ipcRenderer.invoke("sales:create-auction", payload),
    createDirect: (payload: {
      buyerId: string;
      saleDate: string;
      items: DirectSaleItemInput[];
    }): Promise<string> => ipcRenderer.invoke("sales:create-direct", payload),
    createBatch: (payload: {
      mfcSellerId: string;
      saleDate: string;
      items: BatchSaleItemInput[];
    }): Promise<string> => ipcRenderer.invoke("sales:create-batch", payload),
    createFloor: (payload: {
      saleDate: string;
      items: FloorSaleItemInput[];
    }): Promise<string> => ipcRenderer.invoke("sales:create-floor", payload),
  },
  quotes: {
    getOverview: (): Promise<DesktopQuotesOverview> => ipcRenderer.invoke("quotes:get-overview"),
    create: (payload: DesktopQuoteCreateInput): Promise<string> =>
      ipcRenderer.invoke("quotes:create", payload),
  },
  users: {
    list: (): Promise<DesktopUserRecord[]> => ipcRenderer.invoke("users:list"),
    create: (payload: DesktopUserCreateInput): Promise<DesktopUserRecord> =>
      ipcRenderer.invoke("users:create", payload),
    createInvite: (payload: {
      email: string;
      fullName: string;
      businessName?: string | null;
      existingUserId?: string | null;
      phone?: string | null;
      userType: "vendor" | "business";
      defaultRole: "buyer" | "seller";
      requestedPlatform?: "web" | "desktop" | "mobile";
    }): Promise<DesktopUserInvitationResult> => ipcRenderer.invoke("users:create-invite", payload),
    listInvites: (): Promise<import("../shared/contracts").DesktopPendingRegistration[]> =>
      ipcRenderer.invoke("users:list-invites"),
  },
  products: {
    list: (): Promise<DesktopProductRecord[]> => ipcRenderer.invoke("products:list"),
    create: (payload: DesktopProductCreateInput[]): Promise<DesktopProductRecord[]> =>
      ipcRenderer.invoke("products:create", payload),
  },
  stock: {
    getOverview: (): Promise<DesktopStockOverview> => ipcRenderer.invoke("stock:get-overview"),
    create: (payload: DesktopStockBatchCreateInput[]): Promise<{ count: number }> =>
      ipcRenderer.invoke("stock:create", payload),
  },
  ledgers: {
    getCustomerDay: (dateStr: string): Promise<DesktopCustomerDayLedgerSections> =>
      ipcRenderer.invoke("ledgers:get-customer-day", dateStr),
    getCustomerDetail: (userId: string): Promise<DesktopCustomerLedgerDetailPage> =>
      ipcRenderer.invoke("ledgers:get-customer-detail", userId),
    getCustomerHistory: (userId: string): Promise<DesktopCustomerLedgerHistoryPage> =>
      ipcRenderer.invoke("ledgers:get-customer-history", userId),
    getCustomerBill: (userId: string, billId: string): Promise<DesktopCustomerBillPage> =>
      ipcRenderer.invoke("ledgers:get-customer-bill", userId, billId),
    getSellerDay: (dateStr: string): Promise<DesktopSellerDayLedgerRow[]> =>
      ipcRenderer.invoke("ledgers:get-seller-day", dateStr),
    getSellerHistory: (userId: string): Promise<DesktopSellerLedgerHistoryPage> =>
      ipcRenderer.invoke("ledgers:get-seller-history", userId),
  },
  operations: {
    getSummary: (dateStr: string): Promise<DesktopOperationsSummary> =>
      ipcRenderer.invoke("operations:get-summary", dateStr),
  },
  payments: {
    getOverview: (search?: string): Promise<DesktopPaymentsOverview> =>
      ipcRenderer.invoke("payments:get-overview", search),
    getSpendingsOverview: (dateStr?: string, search?: string): Promise<DesktopSpendingsOverview> =>
      ipcRenderer.invoke("payments:get-spendings-overview", dateStr, search),
    getCustomerBillOptions: (customerId: string): Promise<SelectionOption[]> =>
      ipcRenderer.invoke("payments:get-customer-bill-options", customerId),
    getSellerChalanOptions: (sellerId: string): Promise<SelectionOption[]> =>
      ipcRenderer.invoke("payments:get-seller-chalan-options", sellerId),
    createManagerSpending: (payload: DesktopManagerSpendingInput): Promise<void> =>
      ipcRenderer.invoke("payments:create-manager-spending", payload),
    submitSpecificBillPayment: (payload: DesktopCustomerPaymentInput): Promise<void> =>
      ipcRenderer.invoke("payments:submit-specific-bill-payment", payload),
    submitLumpSumPayment: (payload: DesktopLumpSumPaymentInput): Promise<void> =>
      ipcRenderer.invoke("payments:submit-lump-sum-payment", payload),
    submitSellerPayout: (payload: DesktopSellerPayoutInput): Promise<void> =>
      ipcRenderer.invoke("payments:submit-seller-payout", payload),
  },
};

contextBridge.exposeInMainWorld("managerDesktopApi", api);
