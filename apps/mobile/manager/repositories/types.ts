import type {
  MobileChalan,
  MobileCustomerPayment,
  MobileDailyBill,
  MobileQuoteItem,
  MobileSellerPayment,
} from "@/data/local-db";
import type {
  ManagerBuyerPurchaseCard as SharedBuyerPurchaseCard,
  ManagerChalanCard as SharedChalanCard,
  ManagerDueCollectionCard as SharedDueCollectionCard,
  ManagerOperationsSummary as SharedOperationsSummary,
  ManagerPaymentAccountCard as SharedPaymentAccountCard,
  ManagerPaymentHistoryRow as SharedPaymentHistoryRow,
  ManagerPaymentsOverview as SharedPaymentsOverview,
} from "@mfc/manager-ui";
import type {
  CustomerBillDetailView as SharedCustomerBillDetailView,
  CustomerLedgerHistoryRow as SharedCustomerLedgerHistoryRow,
  CustomerLedgerPurchaseRow as SharedCustomerLedgerPurchaseRow,
  DayCustomerLedgerSections as SharedDayCustomerLedgerSections,
  DaySellerLedgerRow as SharedDaySellerLedgerRow,
  LedgerSearchUser as SharedLedgerSearchUser,
  LedgerSummaryEntry as SharedLedgerSummaryEntry,
  ManagerSpendingRow as SharedManagerSpendingRow,
  ManagerSpendingsOverview as SharedManagerSpendingsOverview,
  SellerLedgerHistoryRow as SharedSellerLedgerHistoryRow,
} from "@mfc/manager-workflows";

export type SelectionOption = {
  value: string;
  label: string;
  description?: string | null;
  meta?: string | null;
};

export type HomeSnapshot = {
  auctionSales: number;
  auctionBills: number;
  mfcSales: number;
  mfcBills: number;
  todayCollections: number;
  todayCollectionEntries: number;
  todayCommission: number;
  todayBills: number;
  todayChalans: number;
};

export type DueRow = SharedDueCollectionCard;

export type BuyerPurchaseCard = SharedBuyerPurchaseCard;

export type DailyChalanRow = SharedChalanCard & {
  chalan: MobileChalan;
};

export type ChalanVerificationCard = SharedChalanCard & {
  chalan: MobileChalan;
};

export type OperationsSummary = Omit<SharedOperationsSummary, "chalans" | "verificationCards"> & {
  dateStr: string;
  dueRegister: SharedOperationsSummary["dueRegister"];
  buyerCards: BuyerPurchaseCard[];
  dayChalans: DailyChalanRow[];
  verificationCards: ChalanVerificationCard[];
  daySellerPayments: MobileSellerPayment[];
  dayCustomerPayments: MobileCustomerPayment[];
};

export type CustomerAccountRow = SharedPaymentAccountCard & {
  openBills?: MobileDailyBill[];
};

export type SellerAccountRow = SharedPaymentAccountCard & {
  openChalans?: MobileChalan[];
};

export type PaymentHistoryRow = SharedPaymentHistoryRow;

export type PaymentsOverview = SharedPaymentsOverview & {
  customerAccounts: CustomerAccountRow[];
  sellerAccounts: SellerAccountRow[];
};

export type ManagerSpendingRow = SharedManagerSpendingRow;
export type SpendingsOverview = SharedManagerSpendingsOverview;

export type LedgerSummaryRow = SharedLedgerSummaryEntry;
export type LedgerSearchUser = SharedLedgerSearchUser;
export type CustomerDayLedgerSections = SharedDayCustomerLedgerSections;
export type SellerDayLedgerRow = SharedDaySellerLedgerRow;
export type CustomerLedgerHistorySummaryRow = SharedCustomerLedgerHistoryRow;
export type CustomerLedgerPurchaseRow = SharedCustomerLedgerPurchaseRow;
export type SellerLedgerHistorySummaryRow = SharedSellerLedgerHistoryRow;
export type CustomerBillDetail = SharedCustomerBillDetailView;

export type LedgerHistoryRow = {
  id: string;
  date: string;
  kind: string;
  reference: string;
  note: string;
  amount: number;
  tone: "incoming" | "outgoing";
};

export type LedgerSaleRow = {
  id: string;
  date: string;
  label: string;
  reference: string;
  weight: number;
  pricePerKg: number;
  amount: number;
};

export type LedgerDetail = {
  summary: LedgerSummaryRow;
  historyRows: LedgerHistoryRow[];
  saleRows: LedgerSaleRow[];
};

export type CustomerLedgerDetailPageData = {
  summary?: LedgerSummaryRow;
  purchaseRows: CustomerLedgerPurchaseRow[];
  searchUsers: LedgerSearchUser[];
};

export type CustomerLedgerHistoryPageData = {
  summary?: LedgerSummaryRow;
  historyRows: CustomerLedgerHistorySummaryRow[];
  searchUsers: LedgerSearchUser[];
};

export type SellerLedgerHistoryPageData = {
  summary?: LedgerSummaryRow;
  historyRows: SellerLedgerHistorySummaryRow[];
  searchUsers: LedgerSearchUser[];
};

export type CustomerBillPageData = {
  bill: CustomerBillDetail | null;
  searchUsers: LedgerSearchUser[];
  summary?: LedgerSummaryRow;
};

export type QuoteSummaryRow = {
  id: string;
  quoteNumber: string;
  customerName: string;
  businessName: string | null;
  assignedSellerName: string;
  deliveryDate: string;
  totalAmount: number;
  advancePaid: number;
  status: string;
  notes: string | null;
};

export type QuoteDetail = {
  summary: QuoteSummaryRow;
  items: MobileQuoteItem[];
};

export type SaleFormLookups = {
  userOptions: SelectionOption[];
  auctionSellers: SelectionOption[];
  buyers: SelectionOption[];
  vendors: SelectionOption[];
  mfcSellers: SelectionOption[];
  products: SelectionOption[];
  stockBatches: Array<
    SelectionOption & {
      productId: string;
      productName: string | null;
      currentWeightKg: number;
      mfcSellerId: string | null;
    }
  >;
};

export type SaleLineDraft = {
  id: string;
  buyerId?: string;
  batchId?: string;
  productId?: string;
  productDescription?: string;
  sellerId?: string;
  weight: string;
  rate: string;
};

export type QuoteItemDraft = {
  id: string;
  productId?: string;
  productDescription?: string;
  weightKg: string;
  pricePerKg: string;
};

export type ManagedUserRow = {
  authUserId: string | null;
  businessName: string | null;
  displayName: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  updatedAt: string;
  userType: "business" | "vendor";
  defaultRole: "buyer" | "seller";
};

export type ManagedStaffRow = {
  displayName: string;
  id: string;
  isActive: boolean;
  role: string;
  updatedAt: string;
};

export type UsersOverview = {
  users: ManagedUserRow[];
  staff: ManagedStaffRow[];
};

export type ManagedProductRow = {
  description: string | null;
  id: string;
  isStockTracked: boolean;
  name: string;
  updatedAt: string;
};

export type ManagedStockBatchRow = {
  batchCode: string | null;
  costPerKg: number | null;
  currentWeightKg: number;
  id: string;
  initialWeightKg: number;
  mfcSellerId: string | null;
  mfcSellerName: string | null;
  productId: string;
  productName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  updatedAt: string;
};

export type ManagedStockOverview = {
  batches: ManagedStockBatchRow[];
  products: SelectionOption[];
  sellers: SelectionOption[];
  suppliers: SelectionOption[];
};
