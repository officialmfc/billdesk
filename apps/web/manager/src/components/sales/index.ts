/**
 * Sales Components - Organized Module
 * 
 * This module contains all sales entry components organized by sale type.
 * Each sale type has its own folder with components and types.
 */

// ============================================================================
// Main Sale Entry Components
// ============================================================================

export { AuctionSaleEntry } from "./AuctionSaleEntry";
export { DirectSaleEntry, DirectSaleEntry as PosSaleEntry } from "./DirectSaleEntry";
export { BatchSaleEntry } from "./BatchSaleEntry";
export { FloorSaleEntry } from "./FloorSaleEntry";

// ============================================================================
// Shared Components
// ============================================================================

export { NewSaleButton } from "./NewSaleButton";
export { NewSaleDialog } from "./NewSaleDialog";
export { SalesDetailsPage } from "./SalesDetailsPage";

// ============================================================================
// Types
// ============================================================================

export type {
  SaleType,
  AuctionSaleItem,
  AuctionSaleState,
  PosSaleItem,
  BatchSaleItem,
  FloorSaleItem,
  DirectSaleItem, // Legacy alias
} from "./shared/types";

// ============================================================================
// Organized Exports (for future use)
// ============================================================================

// Auction
export * as Auction from "./auction";

// POS
export * as POS from "./pos";

// Batch
export * as Batch from "./batch";

// Floor
export * as Floor from "./floor";
