import { logger } from "@/lib/logger";
import { getKolkataDateString } from "@/lib/kolkata-date";
import { useAuth } from "@mfc/auth";
import { db } from '@mfc/database';
import { useEffect, useState } from 'react';

interface DashboardStats {
    auctionSales: number;
    auctionBills: number;
    mfcSales: number;
    mfcBills: number;
    todaysCollections: number;
    collectionEntries: number;
    todaysCommission: number;
    todayBills: number;
    chalansToday: number;
}

export function useDashboardStats() {
    const { profile } = useAuth();
    const managerId = profile?.user_id ?? null;
    const [stats, setStats] = useState<DashboardStats>({
        auctionSales: 0,
        auctionBills: 0,
        mfcSales: 0,
        mfcBills: 0,
        todaysCollections: 0,
        collectionEntries: 0,
        todaysCommission: 0,
        todayBills: 0,
        chalansToday: 0,
    });
    const [loading, setLoading] = useState(false); // Changed to false - show immediately
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadStats = async () => {
            try {
                logger.info('📊 Loading dashboard stats from IndexedDB...');

                const today = getKolkataDateString();

                if (!managerId) {
                    if (mounted) {
                        setStats({
                            auctionSales: 0,
                            auctionBills: 0,
                            mfcSales: 0,
                            mfcBills: 0,
                            todaysCollections: 0,
                            collectionEntries: 0,
                            todaysCommission: 0,
                            todayBills: 0,
                            chalansToday: 0,
                        });
                        setError(null);
                    }
                    return;
                }

                const todaysBills = await db.daily_bills
                    .where('[created_by+bill_date]')
                    .equals([managerId, today] as [string, string])
                    .toArray();

                if (!mounted) return;

                const billIds = todaysBills.map((bill) => bill.id);
                const dayTransactions = billIds.length > 0
                    ? await db.sale_transactions.where('daily_bill_id').anyOf(billIds).toArray()
                    : [];

                if (!mounted) return;

                const transactionsByBillId = new Map<string, typeof dayTransactions>();
                for (const transaction of dayTransactions) {
                    const list = transactionsByBillId.get(transaction.daily_bill_id) ?? [];
                    list.push(transaction);
                    transactionsByBillId.set(transaction.daily_bill_id, list);
                }

                const auctionBills = todaysBills.filter((bill) => {
                    const billTransactions = transactionsByBillId.get(bill.id) ?? [];
                    return billTransactions.some((transaction) => transaction.sale_type === "auction");
                });

                const mfcBills = todaysBills.filter((bill) => {
                    const billTransactions = transactionsByBillId.get(bill.id) ?? [];
                    return billTransactions.some(
                        (transaction) =>
                            transaction.sale_type === "direct_sell" || Boolean(transaction.stock_batch_id)
                    );
                });

                const auctionSales = auctionBills.reduce(
                    (sum, bill) => sum + Number(bill.total_amount || 0),
                    0
                );
                const mfcSales = mfcBills.reduce(
                    (sum, bill) => sum + Number(bill.total_amount || 0),
                    0
                );

                const todaysCollectionsRows = await db.customer_payments
                    .where('[created_by+payment_date]')
                    .equals([managerId, today] as [string, string])
                    .toArray();

                if (!mounted) return;

                const todaysCollections = todaysCollectionsRows.reduce(
                    (sum, payment) => sum + Number(payment.amount || 0),
                    0
                );

                const todaysChalans = await db.chalans
                    .where('[created_by+chalan_date]')
                    .equals([managerId, today] as [string, string])
                    .toArray();

                if (!mounted) return;

                const todaysCommission = todaysChalans.reduce(
                    (sum, chalan) => sum + Number(chalan.commission_amount || 0),
                    0
                );

                logger.info({
                    auctionSales,
                    auctionBills: auctionBills.length,
                    mfcSales,
                    mfcBills: mfcBills.length,
                    todaysCollections,
                    collectionEntries: todaysCollectionsRows.length,
                    todaysCommission,
                    todayBills: todaysBills.length,
                    chalansToday: todaysChalans.length,
                });

                setStats({
                    auctionSales,
                    auctionBills: auctionBills.length,
                    mfcSales,
                    mfcBills: mfcBills.length,
                    todaysCollections,
                    collectionEntries: todaysCollectionsRows.length,
                    todaysCommission,
                    todayBills: todaysBills.length,
                    chalansToday: todaysChalans.length,
                });
                setError(null);
            } catch (err) {
                logger.error(err, '❌ Error loading dashboard stats');
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setStats({
                        auctionSales: 0,
                        auctionBills: 0,
                        mfcSales: 0,
                        mfcBills: 0,
                        todaysCollections: 0,
                        collectionEntries: 0,
                        todaysCommission: 0,
                        todayBills: 0,
                        chalansToday: 0,
                    });
                }
            }
        };

        loadStats();

        return () => {
            mounted = false;
        };
    }, [managerId]);

    return { stats, loading, error };
}
