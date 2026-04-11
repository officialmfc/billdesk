/**
 * Sales Types for Auction and Direct Sales
 */

/**
 * Auction Sells - Sales with chalan (like vendor_sells)
 */
export interface AuctionSell {
    id: string;
    chalan_id: string;
    sl_no: number;
    product_description?: string;
    buyer_id?: string;
    buyer_name?: string;
    weight: number;
    rate: number;
    amount: number;
    date: string; // YYYY-MM-DD
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

/**
 * Direct Sells - Sales without chalan
 */
export interface DirectSell {
    id: string;
    sale_number: number;
    sl_no: number;
    product_description?: string;
    buyer_id?: string;
    buyer_name?: string;
    weight: number;
    rate: number;
    amount: number;
    date: string; // YYYY-MM-DD
    created_by: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    notes?: string;
}

/**
 * Sale Item for RPC functions
 */
export interface SaleItemInput {
    weight: number;
    rate: number;
    buyer_id?: string;
    buyer_name?: string;
    product_description?: string;
}

/**
 * Create Auction Chalan Params
 */
export interface CreateAuctionChalanParams {
    p_seller_id: string;
    p_commission_percentage: number;
    p_sell_items: SaleItemInput[];
    p_paid_amount?: number;
    p_payment_notes?: string;
}

/**
 * Create Auction Chalan Result
 */
export interface CreateAuctionChalanResult {
    chalan_id: string;
    chalan_num: number;
    server_total_amount: number;
    server_commission_amount: number;
    server_net_amount: number;
}

/**
 * Create Direct Sale Params
 */
export interface CreateDirectSaleParams {
    p_sell_items: SaleItemInput[];
    p_notes?: string;
}

/**
 * Create Direct Sale Result
 */
export interface CreateDirectSaleResult {
    sale_number: number;
    total_amount: number;
    items_count: number;
}

/**
 * Local types with joined data
 */
export interface LocalAuctionSell extends AuctionSell {
    buyer_display_name?: string;
    chalan_number?: number;
}

export interface LocalDirectSell extends DirectSell {
    buyer_display_name?: string;
    created_by_name?: string;
}

/**
 * Sale summary by type
 */
export interface SaleSummary {
    date: string;
    auction_total: number;
    auction_count: number;
    direct_total: number;
    direct_count: number;
    vendor_total: number;
    vendor_count: number;
    business_total: number;
    business_count: number;
    grand_total: number;
    grand_count: number;
}

/**
 * Buyer purchase summary
 */
export interface BuyerPurchaseSummary {
    buyer_id: string;
    buyer_name: string;
    auction_total: number;
    direct_total: number;
    vendor_total: number;
    business_total: number;
    total_purchases: number;
    last_purchase_date: string;
}
