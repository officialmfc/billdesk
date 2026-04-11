import { buildManagerOperationsSummary } from "@mfc/manager-ui";

import { getLocalDataSnapshot } from "./shared";
import type {
  OperationsSummary,
} from "./types";

export const operationsRepository = {
  async getOperationsSummary(dateStr: string): Promise<OperationsSummary> {
    const {
      users,
      dailyBills,
      customerPayments,
      chalans,
      sellerPayments,
      saleTransactions,
    } = await getLocalDataSnapshot();
    const shared = buildManagerOperationsSummary(dateStr, {
      bills: dailyBills,
      chalans,
      customerPayments,
      saleTransactions,
      sellerPayments,
      users,
    });
    const chalanMap = new Map(chalans.map((chalan) => [chalan.id, chalan]));
    const daySellerPayments = sellerPayments.filter((payment) => payment.payment_date === dateStr);
    const dayCustomerPayments = customerPayments.filter(
      (payment) => payment.payment_date === dateStr
    );

    return {
      ...shared,
      buyerCards: shared.buyerCards,
      dayChalans: shared.chalans.map((card) => ({
        ...card,
        chalan: chalanMap.get(card.chalan.id) ?? (card.chalan as never),
      })),
      dayCustomerPayments,
      daySellerPayments,
      verificationCards: shared.verificationCards.map((card) => ({
        ...card,
        chalan: chalanMap.get(card.chalan.id) ?? (card.chalan as never),
      })),
    };
  },
};
