import { ipcMain } from "electron";

import type {
  AuctionSaleItemInput,
  DesktopPrintBusinessConfig,
  BatchSaleItemInput,
  DesktopProductCreateInput,
  DesktopProductRecord,
  DesktopCustomerPaymentInput,
  DesktopCustomerBillPage,
  DesktopCustomerDayLedgerSections,
  DesktopCustomerLedgerDetailPage,
  DesktopCustomerLedgerHistoryPage,
  DesktopLumpSumPaymentInput,
  DesktopManagerSpendingInput,
  DesktopSellerDayLedgerRow,
  DesktopSellerLedgerHistoryPage,
  DesktopSellerPayoutInput,
  DesktopSpendingsOverview,
  DesktopStockBatchCreateInput,
  DesktopStockOverview,
  DesktopQuoteCreateInput,
  DesktopQuotesOverview,
  DesktopUserCreateInput,
  DesktopUserInvitationResult,
  DesktopUserRecord,
  DirectSaleItemInput,
  FloorSaleItemInput,
} from "../shared/contracts";
import { desktopEnv } from "./env";
import {
  createProducts,
  createStockBatches,
  createUser,
  createUserInvitation,
  listPendingRegistrations,
  getProductsList,
  getStockOverview,
  getUsersList,
} from "./admin-service";
import {
  getCustomerBillPage,
  getCustomerDayLedger,
  getCustomerLedgerDetailPage,
  getCustomerLedgerHistoryPage,
  getSellerDayLedger,
  getSellerLedgerHistoryPage,
} from "./ledgers-service";
import { getOperationsSummary } from "./operations-service";
import {
  getCustomerBillOptions,
  getPaymentsOverview,
  getSpendingsOverview,
  getSellerChalanOptions,
  createManagerSpending,
  submitLumpSumPayment,
  submitSellerPayout,
  submitSpecificBillPayment,
} from "./payments-service";
import { createQuote, getQuotesOverview } from "./quotes-service";
import { createAuctionSale, createBatchSale, createDirectSale, createFloorSale, getSaleFormLookups } from "./sales-service";
import { getPowerSyncService } from "./powersync";
import {
  getCachedProfile,
  loginAsManagerWithHostedAuth,
  openHostedPasswordReset,
  logoutManager,
} from "./supabase";

const HANDLER_CHANNELS = [
  "app:get-print-config",
  "auth:get-state",
  "auth:login-hosted",
  "auth:open-password-reset",
  "auth:logout",
  "sync:get-status",
  "sync:refresh",
  "sales:get-lookups",
  "quotes:get-overview",
  "quotes:create",
  "users:list",
  "users:list-invites",
  "users:create",
  "users:create-invite",
  "products:list",
  "products:create",
  "stock:get-overview",
  "stock:create",
  "ledgers:get-customer-day",
  "ledgers:get-customer-detail",
  "ledgers:get-customer-history",
  "ledgers:get-customer-bill",
  "ledgers:get-seller-day",
  "ledgers:get-seller-history",
  "operations:get-summary",
  "payments:get-overview",
  "payments:get-spendings-overview",
  "payments:get-customer-bill-options",
  "payments:get-seller-chalan-options",
  "payments:create-manager-spending",
  "payments:submit-specific-bill-payment",
  "payments:submit-lump-sum-payment",
  "payments:submit-seller-payout",
  "sales:create-auction",
  "sales:create-direct",
  "sales:create-batch",
  "sales:create-floor",
] as const;

export function registerIpcHandlers(): void {
  for (const channel of HANDLER_CHANNELS) {
    ipcMain.removeHandler(channel);
  }

  ipcMain.handle("app:get-print-config", async (): Promise<DesktopPrintBusinessConfig> => ({
    address: desktopEnv.businessAddress,
    email: desktopEnv.businessEmail,
    gst: desktopEnv.businessGst,
    name: desktopEnv.businessName,
    phone: desktopEnv.businessPhone,
  }));

  ipcMain.handle("auth:get-state", async () => getCachedProfile());
  ipcMain.handle("auth:login-hosted", async () => {
    const profile = await loginAsManagerWithHostedAuth();
    await getPowerSyncService().connect(true);
    return profile;
  });
  ipcMain.handle("auth:open-password-reset", async () => {
    await openHostedPasswordReset();
    return true;
  });
  ipcMain.handle("auth:logout", async () => {
    try {
      await getPowerSyncService().disconnectAndClear();
    } catch (error) {
      console.error("[Desktop Auth] PowerSync cleanup failed during logout:", error);
    }
    await logoutManager();
    return true;
  });

  ipcMain.handle("sync:get-status", async () => getPowerSyncService().getStatus());
  ipcMain.handle("sync:refresh", async () => {
    await getPowerSyncService().refresh();
    return getPowerSyncService().getStatus();
  });

  ipcMain.handle("sales:get-lookups", async () => getSaleFormLookups());
  ipcMain.handle("quotes:get-overview", async (): Promise<DesktopQuotesOverview> =>
    getQuotesOverview()
  );
  ipcMain.handle(
    "quotes:create",
    async (_event, payload: DesktopQuoteCreateInput): Promise<string> => createQuote(payload)
  );
  ipcMain.handle("users:list", async (): Promise<DesktopUserRecord[]> => getUsersList());
  ipcMain.handle(
    "users:list-invites",
    async () => listPendingRegistrations()
  );
  ipcMain.handle(
    "users:create",
    async (_event, payload: DesktopUserCreateInput): Promise<DesktopUserRecord> =>
      createUser(payload)
  );
  ipcMain.handle(
    "users:create-invite",
    async (
      _event,
      payload: {
      email: string;
      fullName: string;
      businessName?: string | null;
      existingUserId?: string | null;
      phone?: string | null;
      userType: "vendor" | "business";
      defaultRole: "buyer" | "seller";
      requestedPlatform?: "web" | "desktop" | "mobile";
      }
    ): Promise<DesktopUserInvitationResult> => createUserInvitation(payload)
  );
  ipcMain.handle("products:list", async (): Promise<DesktopProductRecord[]> => getProductsList());
  ipcMain.handle(
    "products:create",
    async (_event, payload: DesktopProductCreateInput[]): Promise<DesktopProductRecord[]> =>
      createProducts(payload)
  );
  ipcMain.handle("stock:get-overview", async (): Promise<DesktopStockOverview> => getStockOverview());
  ipcMain.handle(
    "stock:create",
    async (_event, payload: DesktopStockBatchCreateInput[]): Promise<{ count: number }> =>
      createStockBatches(payload)
  );
  ipcMain.handle("ledgers:get-customer-day", async (_event, dateStr: string): Promise<DesktopCustomerDayLedgerSections> =>
    getCustomerDayLedger(dateStr)
  );
  ipcMain.handle("ledgers:get-customer-detail", async (_event, userId: string): Promise<DesktopCustomerLedgerDetailPage> =>
    getCustomerLedgerDetailPage(userId)
  );
  ipcMain.handle("ledgers:get-customer-history", async (_event, userId: string): Promise<DesktopCustomerLedgerHistoryPage> =>
    getCustomerLedgerHistoryPage(userId)
  );
  ipcMain.handle("ledgers:get-customer-bill", async (_event, userId: string, billId: string): Promise<DesktopCustomerBillPage> =>
    getCustomerBillPage(userId, billId)
  );
  ipcMain.handle("ledgers:get-seller-day", async (_event, dateStr: string): Promise<DesktopSellerDayLedgerRow[]> =>
    getSellerDayLedger(dateStr)
  );
  ipcMain.handle("ledgers:get-seller-history", async (_event, userId: string): Promise<DesktopSellerLedgerHistoryPage> =>
    getSellerLedgerHistoryPage(userId)
  );
  ipcMain.handle("operations:get-summary", async (_event, dateStr: string) =>
    getOperationsSummary(dateStr)
  );
  ipcMain.handle("payments:get-overview", async (_event, search?: string) =>
    getPaymentsOverview(search ?? "")
  );
  ipcMain.handle(
    "payments:get-spendings-overview",
    async (_event, dateStr?: string, search?: string): Promise<DesktopSpendingsOverview> =>
      getSpendingsOverview(dateStr, search ?? "")
  );
  ipcMain.handle("payments:get-customer-bill-options", async (_event, customerId: string) =>
    getCustomerBillOptions(customerId)
  );
  ipcMain.handle("payments:get-seller-chalan-options", async (_event, sellerId: string) =>
    getSellerChalanOptions(sellerId)
  );
  ipcMain.handle(
    "payments:create-manager-spending",
    async (_event, payload: DesktopManagerSpendingInput) => createManagerSpending(payload)
  );
  ipcMain.handle(
    "payments:submit-specific-bill-payment",
    async (_event, payload: DesktopCustomerPaymentInput) => submitSpecificBillPayment(payload)
  );
  ipcMain.handle(
    "payments:submit-lump-sum-payment",
    async (_event, payload: DesktopLumpSumPaymentInput) => submitLumpSumPayment(payload)
  );
  ipcMain.handle(
    "payments:submit-seller-payout",
    async (_event, payload: DesktopSellerPayoutInput) => submitSellerPayout(payload)
  );
  ipcMain.handle(
    "sales:create-auction",
    async (
      _event,
      payload: {
        sellerId: string;
        commissionPercentage: number;
        paidAmount?: number;
        saleDate: string;
        items: AuctionSaleItemInput[];
      }
    ) => createAuctionSale(payload)
  );
  ipcMain.handle(
    "sales:create-direct",
    async (
      _event,
      payload: { buyerId: string; saleDate: string; items: DirectSaleItemInput[] }
    ) => createDirectSale(payload)
  );
  ipcMain.handle(
    "sales:create-batch",
    async (
      _event,
      payload: { mfcSellerId: string; saleDate: string; items: BatchSaleItemInput[] }
    ) => createBatchSale(payload)
  );
  ipcMain.handle(
    "sales:create-floor",
    async (
      _event,
      payload: { saleDate: string; items: FloorSaleItemInput[] }
    ) => createFloorSale(payload)
  );
}
