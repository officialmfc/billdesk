import { getUserDisplay, getLocalDataSnapshot } from "./shared";
import type { QuoteDetail, QuoteSummaryRow, SaleFormLookups } from "./types";

export const quotesRepository = {
  async getQuotes(search = "", status: string | null = null): Promise<QuoteSummaryRow[]> {
    const { users, mfcStaff, quotes } = await getLocalDataSnapshot();
    const query = search.trim().toLowerCase();
    const userMap = new Map(users.map((user) => [user.id, user]));
    const sellerMap = new Map(mfcStaff.map((seller) => [seller.id, seller]));

    return quotes
      .map((quote) => {
        const customer = getUserDisplay(userMap.get(quote.customer_id));
        const assignedSeller = quote.assigned_mfc_seller_id
          ? sellerMap.get(quote.assigned_mfc_seller_id)?.full_name
          : null;

        return {
          id: quote.id,
          quoteNumber: quote.quote_number,
          customerName: customer.name,
          businessName: customer.businessName,
          assignedSellerName: assignedSeller ?? "Unassigned",
          deliveryDate: quote.delivery_date,
          totalAmount: Number(quote.total_amount),
          advancePaid: Number(quote.advance_paid),
          status: quote.status,
          notes: quote.notes,
        };
      })
      .filter((quote) => {
        if (status && quote.status !== status) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          quote.quoteNumber.toLowerCase().includes(query) ||
          quote.customerName.toLowerCase().includes(query) ||
          quote.businessName?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate));
  },

  async getQuoteDetail(quoteId: string): Promise<QuoteDetail | null> {
    const { quoteItems } = await getLocalDataSnapshot();
    const summary = (await this.getQuotes()).find((quote) => quote.id === quoteId);

    if (!summary) {
      return null;
    }

    return {
      summary,
      items: quoteItems.filter((item) => item.quote_id === quoteId),
    };
  },

  async getQuoteFormLookups(): Promise<Pick<SaleFormLookups, "buyers" | "mfcSellers" | "products">> {
    const { users, mfcStaff, products } = await getLocalDataSnapshot();

    return {
      buyers: users
        .filter((user) => user.user_type === "business" && user.is_active)
        .map((user) => ({
          value: user.id,
          label: user.business_name || user.name,
          description: user.business_name ? user.name : null,
          meta: user.phone,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      mfcSellers: mfcStaff
        .filter((staff) => staff.role === "mfc_seller" && staff.is_active)
        .map((staff) => ({
          value: staff.id,
          label: staff.full_name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      products: products
        .map((product) => ({
          value: product.id,
          label: product.name,
          description: product.description,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  },
};
