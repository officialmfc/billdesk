import { supabase } from './supabase';

// Type definitions for RPC parameters
export interface StaffProfile {
  user_id: string;
  user_role: 'admin' | 'manager' | 'mfc_seller';
  is_active: boolean;
  display_name: string;
  full_name?: string;
}

export interface CreateAuctionSaleParams {
  p_seller_id: string;
  p_sale_items: Array<{
    buyer_id: string;
    product_description: string;
    weight: number;
    rate: number;
  }>;
  p_commission_percentage: number;
  p_paid_amount?: number;
  p_chalan_date: string; // YYYY-MM-DD
}

export interface DirectSaleParams {
  p_buyer_id: string;
  p_sale_items: Array<{
    stock_batch_id: string;
    product_id: string;
    weight: number;
    rate: number;
    mfc_seller_id: string;
  }>;
  p_sale_date: string; // YYYY-MM-DD
}

export interface BatchSaleParams {
  p_mfc_seller_id: string;
  p_sale_items: Array<{
    buyer_id: string;
    stock_batch_id: string;
    product_id: string;
    weight: number;
    rate: number;
  }>;
  p_sale_date: string; // YYYY-MM-DD
}

export interface FloorSaleParams {
  p_sale_items: Array<{
    buyer_id: string;
    mfc_seller_id: string;
    stock_batch_id: string;
    product_id: string;
    weight: number;
    rate: number;
  }>;
  p_sale_date: string; // YYYY-MM-DD
}

export interface BillPaymentParams {
  p_daily_bill_id: string;
  p_amount: number;
  p_payment_method: string;
  p_payment_date: string; // YYYY-MM-DD
}

export interface SellerPayoutParams {
  p_chalan_id: string;
  p_amount: number;
  p_payment_method: string;
  p_payment_date: string; // YYYY-MM-DD
}

export interface LumpSumPaymentParams {
  p_customer_id: string;
  p_total_amount: number;
  p_payment_method: string;
  p_payment_date: string; // YYYY-MM-DD
}

export interface ApproveUserParams {
  p_registration_id: string;
  p_default_role: string;
  p_user_type: 'vendor' | 'business';
  p_address?: any;
  p_profile_photo_url?: string;
}

export interface CreateUserParams {
  p_full_name: string;
  p_business_name: string;
  p_phone: string;
  p_user_type: 'vendor' | 'business';
  p_default_role: string;
  p_address?: any;
  p_profile_photo_url?: string;
}

export interface CreateUserInvitationParams {
  p_email: string;
  p_full_name: string;
  p_business_name?: string | null;
  p_phone?: string | null;
  p_user_type: 'vendor' | 'business';
  p_default_role: 'buyer' | 'seller';
  p_requested_platform?: 'web' | 'desktop' | 'mobile';
}

export interface InvitationResult {
  invite_token: string;
  registration_id: string;
  requested_app: string;
  requested_platform: string;
  signup_path: string;
}

function authHubBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

async function getAuthHubToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token?.trim();
  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

async function postAuthHubJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAuthHubToken();
  const response = await fetch(`${authHubBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

export interface CreateQuoteParams {
  p_customer_id: string;
  p_assigned_mfc_seller_id: string;
  p_delivery_date: string; // YYYY-MM-DD
  p_quote_number: string;
  p_items: Array<{
    product_id: string | null;
    product_description: string;
    weight_kg: number;
    price_per_kg: number;
  }>;
  p_notes?: string;
}

export interface PurchaseStockParams {
  p_seller_id: string;
  p_commission_percentage: number;
  p_mfc_seller_id_to_assign: string;
  p_purchase_items: Array<{
    product_id: string;
    product_description: string;
    weight: number;
    rate: number;
  }>;
  p_purchase_date: string; // YYYY-MM-DD
}

export interface CreateManagerSpendingParams {
  p_title: string;
  p_category: string;
  p_amount: number;
  p_note?: string | null;
  p_payment_method: string;
  p_spent_date: string; // YYYY-MM-DD
}

export class RPCService {
  private async getAuthHubToken(): Promise<string> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token?.trim();
    if (!token) {
      throw new Error("Please sign in again.");
    }

    return token;
  }

  private async postAuthHubJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${authHubBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await this.getAuthHubToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as { error?: string } & T;
    if (!response.ok) {
      throw new Error(payload.error || "Request failed.");
    }

    return payload;
  }

  async getCurrentUserInfo(): Promise<StaffProfile | null> {
    const profileFetchers: Array<{
      role: StaffProfile["user_role"];
      rpc: "get_current_admin_profile" | "get_current_manager_info" | "get_current_mfc_seller_profile";
    }> = [
      { role: "admin", rpc: "get_current_admin_profile" },
      { role: "manager", rpc: "get_current_manager_info" },
      { role: "mfc_seller", rpc: "get_current_mfc_seller_profile" },
    ];

    for (const fetcher of profileFetchers) {
      const { data, error } = await supabase.rpc(fetcher.rpc);

      if (error) {
        continue;
      }

      const profile = (data as { profile?: { id?: string; full_name?: string; is_active?: boolean } | null } | null)
        ?.profile;

      if (!profile?.id || !profile.full_name) {
        continue;
      }

      return {
        user_id: profile.id,
        user_role: fetcher.role,
        is_active: Boolean(profile.is_active),
        display_name: profile.full_name,
        full_name: profile.full_name,
      };
    }

    return null;
  }

  async get_user_profile(user_id: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async get_mfc_staff_info(staff_id: string): Promise<any> {
    const { data, error } = await supabase
      .from('mfc_staff')
      .select('*')
      .eq('id', staff_id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async get_user_info_by_role(user_id: string, role: string): Promise<any> {
    if (role === 'admin' || role === 'manager' || role === 'mfc_seller' || role === 'mfc_staff') {
      return this.get_mfc_staff_info(user_id);
    } else {
      return this.get_user_profile(user_id);
    }
  }

  /**
   * Create an auction sale
   */
  async createAuctionSale(params: CreateAuctionSaleParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_auction_sale', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Submit direct sale to customer
   */
  async createSaleForSingleCustomer(params: DirectSaleParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_sale_for_single_customer', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Create seller batch sale
   */
  async createSellerBatchSale(params: BatchSaleParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_seller_batch_sale', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Create a floor sale
   */
  async createFloorSale(params: FloorSaleParams): Promise<any> {
    const { data, error } = await supabase.rpc('create_floor_sale', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Submit specific bill payment
   */
  async submitSpecificBillPayment(params: BillPaymentParams): Promise<any> {
    const { data, error } = await supabase.rpc('submit_specific_bill_payment', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Check if the response indicates an error
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      throw new Error(data.error || 'Payment failed');
    }
    
    return data;
  }

  /**
   * Submit seller payout
   */
  async submitSellerPayout(params: SellerPayoutParams): Promise<string> {
    const { data, error } = await supabase.rpc('submit_seller_payout', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Submit lump sum payment
   */
  async submitLumpSumPayment(params: LumpSumPaymentParams): Promise<any> {
    const { data, error } = await supabase.rpc('submit_lump_sum_payment', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Check if the response indicates an error
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      throw new Error(data.error || 'Payment failed');
    }
    
    return data;
  }

  /**
   * Approve user registration
   */
  async approveUser(params: ApproveUserParams): Promise<string> {
    const result = await this.postAuthHubJson<{ activationToken?: string; signupPath?: string }>(
      `/api/requests/${params.p_registration_id}/approve`,
      { requestId: params.p_registration_id }
    );

    return result.signupPath || "";
  }

  /**
   * Create user as staff
   */
  async createUserAsStaff(params: CreateUserParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_user_as_staff', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Create a user invitation that routes through the hosted auth hub
   */
  async createUserInvitation(params: CreateUserInvitationParams): Promise<InvitationResult> {
    return postAuthHubJson<InvitationResult>('/api/invites/user', {
      email: params.p_email,
      fullName: params.p_full_name,
      businessName: params.p_business_name,
      phone: params.p_phone,
      userType: params.p_user_type,
      defaultRole: params.p_default_role,
      requestedPlatform: params.p_requested_platform ?? 'mobile',
    });
  }

  /**
   * Reject registration
   */
  async rejectRegistration(registrationId: string): Promise<void> {
    await this.postAuthHubJson(`/api/requests/${registrationId}/reject`, {
      requestId: registrationId,
    });
  }

  /**
   * Create quote
   */
  async createQuote(params: CreateQuoteParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_quote', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Log quote advance payment
   */
  async logQuoteAdvance(quoteId: string, amountPaid: number): Promise<void> {
    const { error } = await supabase.rpc('log_quote_advance', {
      p_quote_id: quoteId,
      p_amount_paid: amountPaid,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Purchase stock from seller
   */
  async purchaseStockFromSeller(params: PurchaseStockParams): Promise<string> {
    const { data, error } = await supabase.rpc('purchase_stock_from_seller', params);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  async createManagerSpending(params: CreateManagerSpendingParams): Promise<string> {
    const { data, error } = await supabase.rpc('create_manager_spending', params);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const rpcService = new RPCService();
