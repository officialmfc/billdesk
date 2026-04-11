/**
 * Consolidated types for all sales components
 */

// ============================================================================
// MFC Sales Types
// ============================================================================

export type SaleType = "auction" | "pos" | "batch" | "floor";

// POS Sale (Point of Sale): Multi-seller → Single buyer
export interface PosSaleItem {
  id: string;
  mfcSellerName: string;
  mfcSellerId: string | null;
  productName: string;
  productId: string | null;
  stockBatchId: string | null;
  weight: number;
  rate: number;
  total: number;
}

// Batch Sale: Single seller → Multi-buyer
export interface BatchSaleItem {
  id: string;
  buyerName: string;
  buyerId: string | null;
  productName: string;
  productId: string | null;
  stockBatchId: string | null;
  weight: number;
  rate: number;
  total: number;
}

// Floor Sale (quick entry): Multi-seller → Multi-buyer
export interface FloorSaleItem {
  id: string;
  mfcSellerName: string;
  mfcSellerId: string | null;
  buyerName: string;
  buyerId: string | null;
  productName: string;
  productId: string | null;
  stockBatchId: string | null;
  weight: number;
  rate: number;
  total: number;
}

// ============================================================================
// Auction Sales Types
// ============================================================================

export interface AuctionSaleItem {
  id: string;
  buyerName: string;
  buyerId: string | null;
  productDescription: string;
  weight: number;
  rate: number;
  total: number;
}

export interface AuctionSaleState {
  chalanDate: string;
  sellerName: string;
  sellerId: string | null;
  commissionPercentage: number;
  paidAmount: number;
  saleItems: AuctionSaleItem[];
  saving: boolean;
}

// ============================================================================
// Legacy type aliases for backward compatibility
// ============================================================================

/** @deprecated Use PosSaleItem instead */
export type DirectSaleItem = PosSaleItem;
