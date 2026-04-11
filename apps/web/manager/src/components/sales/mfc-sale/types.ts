// Common types for MFC sales

export type SaleType = "direct" | "batch" | "floor";

// Direct Sale (to single customer): Multi-seller, single buyer
export interface DirectSaleItem {
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

// Batch Sale (from single seller): Single seller, multi-buyer
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

// Floor Sale (quick entry): Multi-seller, multi-buyer
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
