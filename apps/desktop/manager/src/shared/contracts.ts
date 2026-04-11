import type {
  ManagerOperationsSummary,
  ManagerPaymentsOverview,
} from "@mfc/manager-ui";
import type {
  CustomerBillDetailView,
  CustomerLedgerHistoryRow,
  CustomerLedgerPurchaseRow,
  DayCustomerLedgerSections,
  DaySellerLedgerRow,
  LedgerSearchUser,
  LedgerSummaryEntry,
  ManagerSpendingsOverview,
  SellerLedgerHistoryRow,
} from "@mfc/manager-workflows";

export type StaffProfile = {
  user_id: string;
  user_role: "manager";
  is_active: boolean;
  display_name: string;
  full_name: string;
  email?: string;
};

export type SyncStatus = {
  connected: boolean;
  connecting: boolean;
  hasSynced: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
};

export type DesktopPrintBusinessConfig = {
  address: string;
  email: string;
  gst: string;
  name: string;
  phone: string;
};

export type SelectionOption = {
  value: string;
  label: string;
  description?: string | null;
  meta?: string | null;
};

export type PaymentMethod = "cash" | "bank_transfer" | "upi" | "check";

export type StockBatchOption = SelectionOption & {
  productId: string;
  productName: string | null;
  currentWeightKg: number;
  mfcSellerId: string | null;
};

export type DesktopCustomerPaymentInput = {
  amount: number;
  billId: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
};

export type DesktopLumpSumPaymentInput = {
  amount: number;
  customerId: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
};

export type DesktopSellerPayoutInput = {
  amount: number;
  chalanId: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
};

export type DesktopManagerSpendingInput = {
  amount: number;
  category: string;
  note?: string | null;
  paymentMethod: PaymentMethod;
  spentDate: string;
  title: string;
};

export type SaleFormLookups = {
  userOptions: SelectionOption[];
  auctionSellers: SelectionOption[];
  buyers: SelectionOption[];
  vendors: SelectionOption[];
  mfcSellers: SelectionOption[];
  products: SelectionOption[];
  stockBatches: StockBatchOption[];
};

export type AuctionSaleItemInput = {
  buyer_id: string;
  product_description: string;
  weight: number;
  rate: number;
};

export type DirectSaleItemInput = {
  stock_batch_id: string;
  product_id: string;
  weight: number;
  rate: number;
  mfc_seller_id: string;
};

export type BatchSaleItemInput = {
  buyer_id: string;
  stock_batch_id: string;
  product_id: string;
  weight: number;
  rate: number;
};

export type FloorSaleItemInput = {
  buyer_id: string;
  mfc_seller_id: string;
  stock_batch_id: string;
  product_id: string;
  weight: number;
  rate: number;
};

export type DesktopOperationsSummary = ManagerOperationsSummary;
export type DesktopPaymentsOverview = ManagerPaymentsOverview;
export type DesktopSpendingsOverview = ManagerSpendingsOverview;

export type DesktopLedgerSummary = LedgerSummaryEntry;
export type DesktopLedgerSearchUser = LedgerSearchUser;
export type DesktopCustomerDayLedgerSections = DayCustomerLedgerSections;
export type DesktopSellerDayLedgerRow = DaySellerLedgerRow;
export type DesktopCustomerLedgerHistoryRow = CustomerLedgerHistoryRow;
export type DesktopCustomerLedgerPurchaseRow = CustomerLedgerPurchaseRow;
export type DesktopSellerLedgerHistoryRow = SellerLedgerHistoryRow;
export type DesktopCustomerBillDetail = CustomerBillDetailView;

export type DesktopCustomerLedgerDetailPage = {
  summary?: DesktopLedgerSummary;
  purchaseRows: DesktopCustomerLedgerPurchaseRow[];
  searchUsers: DesktopLedgerSearchUser[];
};

export type DesktopCustomerLedgerHistoryPage = {
  summary?: DesktopLedgerSummary;
  historyRows: DesktopCustomerLedgerHistoryRow[];
  searchUsers: DesktopLedgerSearchUser[];
};

export type DesktopSellerLedgerHistoryPage = {
  summary?: DesktopLedgerSummary;
  historyRows: DesktopSellerLedgerHistoryRow[];
  searchUsers: DesktopLedgerSearchUser[];
};

export type DesktopCustomerBillPage = {
  bill: DesktopCustomerBillDetail | null;
  summary?: DesktopLedgerSummary;
  searchUsers: DesktopLedgerSearchUser[];
};

export type DesktopUserRecord = {
  id: string;
  authUserId: string | null;
  name: string;
  businessName: string | null;
  phone: string | null;
  userType: "vendor" | "business";
  defaultRole: "buyer" | "seller";
  isActive: boolean;
  updatedAt: string;
};

export type DesktopUserCreateInput = {
  authMode: "with_invite" | "without_auth";
  email?: string;
  fullName: string;
  businessName?: string;
  phone: string;
  userType: "vendor" | "business";
  defaultRole: "buyer" | "seller";
};

export type DesktopUserInvitationResult = {
  inviteToken: string;
  registrationId: string;
  requestedApp: string;
  requestedPlatform: string;
  signupPath: string;
  signupUrl: string;
};

export type DesktopProductRecord = {
  id: string;
  name: string;
  description: string | null;
  isStockTracked: boolean;
  updatedAt: string;
};

export type DesktopProductCreateInput = {
  name: string;
  description?: string;
  isStockTracked?: boolean;
};

export type DesktopStockBatchRecord = {
  id: string;
  batchCode: string | null;
  productId: string;
  productName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  mfcSellerId: string | null;
  mfcSellerName: string | null;
  initialWeightKg: number;
  currentWeightKg: number;
  costPerKg: number | null;
  updatedAt: string;
};

export type DesktopStockBatchCreateInput = {
  productId: string | null;
  productName?: string;
  mfcSellerId: string;
  supplierId?: string | null;
  initialWeightKg: number;
  costPerKg?: number | null;
};

export type DesktopStockOverview = {
  batches: DesktopStockBatchRecord[];
  products: DesktopProductRecord[];
  sellers: SelectionOption[];
  suppliers: DesktopUserRecord[];
};

export type DesktopQuoteRecord = {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  assignedMfcSellerId: string | null;
  sellerName: string | null;
  deliveryDate: string;
  totalAmount: number;
  advancePaid: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  notes: string | null;
  updatedAt: string;
  createdAt?: string | null;
};

export type DesktopQuoteItemInput = {
  productId?: string | null;
  productDescription: string;
  weightKg: number;
  pricePerKg: number;
};

export type DesktopQuoteCreateInput = {
  customerId: string;
  assignedMfcSellerId: string;
  deliveryDate: string;
  quoteNumber: string;
  notes?: string;
  items: DesktopQuoteItemInput[];
};

export type DesktopQuotesOverview = {
  quotes: DesktopQuoteRecord[];
  customers: DesktopUserRecord[];
  sellers: SelectionOption[];
  products: DesktopProductRecord[];
};
