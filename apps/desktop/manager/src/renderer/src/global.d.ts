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
} from "../../shared/contracts";

declare global {
  interface Window {
    managerDesktopApi: {
      app: {
        getPrintConfig(): Promise<DesktopPrintBusinessConfig>;
      };
      auth: {
        getState(): Promise<StaffProfile | null>;
        loginWithAuthHub(): Promise<StaffProfile>;
        openPasswordReset(): Promise<boolean>;
        logout(): Promise<boolean>;
      };
      sync: {
        getStatus(): Promise<SyncStatus>;
        refresh(): Promise<SyncStatus>;
      };
      sales: {
        getLookups(): Promise<SaleFormLookups>;
        createAuction(payload: {
          sellerId: string;
          commissionPercentage: number;
          paidAmount?: number;
          saleDate: string;
          items: AuctionSaleItemInput[];
        }): Promise<string>;
        createDirect(payload: {
          buyerId: string;
          saleDate: string;
          items: DirectSaleItemInput[];
        }): Promise<string>;
        createBatch(payload: {
          mfcSellerId: string;
          saleDate: string;
          items: BatchSaleItemInput[];
        }): Promise<string>;
        createFloor(payload: {
          saleDate: string;
          items: FloorSaleItemInput[];
        }): Promise<string>;
      };
      quotes: {
        getOverview(): Promise<DesktopQuotesOverview>;
        create(payload: DesktopQuoteCreateInput): Promise<string>;
      };
      users: {
        list(): Promise<DesktopUserRecord[]>;
        create(payload: DesktopUserCreateInput): Promise<DesktopUserRecord>;
        createInvite(payload: {
          email: string;
          fullName: string;
          businessName?: string | null;
          phone?: string | null;
          userType: "vendor" | "business";
          defaultRole: "buyer" | "seller";
          requestedPlatform?: "web" | "desktop" | "mobile";
        }): Promise<DesktopUserInvitationResult>;
      };
      products: {
        list(): Promise<DesktopProductRecord[]>;
        create(payload: DesktopProductCreateInput[]): Promise<DesktopProductRecord[]>;
      };
      stock: {
        getOverview(): Promise<DesktopStockOverview>;
        create(payload: DesktopStockBatchCreateInput[]): Promise<{ count: number }>;
      };
      ledgers: {
        getCustomerDay(dateStr: string): Promise<DesktopCustomerDayLedgerSections>;
        getCustomerDetail(userId: string): Promise<DesktopCustomerLedgerDetailPage>;
        getCustomerHistory(userId: string): Promise<DesktopCustomerLedgerHistoryPage>;
        getCustomerBill(userId: string, billId: string): Promise<DesktopCustomerBillPage>;
        getSellerDay(dateStr: string): Promise<DesktopSellerDayLedgerRow[]>;
        getSellerHistory(userId: string): Promise<DesktopSellerLedgerHistoryPage>;
      };
      operations: {
        getSummary(dateStr: string): Promise<DesktopOperationsSummary>;
      };
      payments: {
        getOverview(search?: string): Promise<DesktopPaymentsOverview>;
        getSpendingsOverview(dateStr?: string, search?: string): Promise<DesktopSpendingsOverview>;
        getCustomerBillOptions(customerId: string): Promise<SelectionOption[]>;
        getSellerChalanOptions(sellerId: string): Promise<SelectionOption[]>;
        createManagerSpending(payload: DesktopManagerSpendingInput): Promise<void>;
        submitSpecificBillPayment(payload: DesktopCustomerPaymentInput): Promise<void>;
        submitLumpSumPayment(payload: DesktopLumpSumPaymentInput): Promise<void>;
        submitSellerPayout(payload: DesktopSellerPayoutInput): Promise<void>;
      };
    };
  }
}

export {};
