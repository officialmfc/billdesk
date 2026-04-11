"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DateNavigator } from "@/components/date-navigator";
import { useUserApp } from "@/components/providers/user-app-provider";
import { formatCurrency } from "@/lib/format";
import {
  getCurrentDateIST,
  shiftDay,
} from "@/lib/date";
import {
  getUserTodayData,
  syncCurrentUserData,
  type UserTodayData,
} from "@/lib/user-api";

export default function BillsPage(): React.JSX.Element {
  const { profile } = useUserApp();
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [data, setData] = useState<UserTodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refreshRemote = true) => {
    if (!profile?.id) {
      return;
    }

    setRefreshing(true);
    try {
      setData(await getUserTodayData(profile.id, dateStr));

      if (refreshRemote) {
        try {
          await syncCurrentUserData();
          setData(await getUserTodayData(profile.id, dateStr));
        } catch {
          // Keep cached day data visible.
        }
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [dateStr, profile?.id]);

  const dayTotal = useMemo(
    () => (data?.buyerBills ?? []).reduce((sum, bill) => sum + bill.totalAmount, 0),
    [data?.buyerBills]
  );
  const dayDue = useMemo(
    () =>
      (data?.buyerBills ?? []).reduce(
        (sum, bill) => sum + Math.max(bill.totalAmount - bill.amountPaid, 0),
        0
      ),
    [data?.buyerBills]
  );

  if (loading) {
    return (
      <section className="card">
        <div className="card__body loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Loading bills...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="panel hero panel--soft">
        <div className="hero__top">
          <div>
            <p className="hero__eyebrow">User</p>
            <h1 className="hero__title">Bills</h1>
            <p className="hero__subtitle">
              {profile?.businessName || profile?.name || "Your account"}
            </p>
          </div>
        </div>
      </section>

      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDay(current, -1))}
        onNext={() => setDateStr((current) => shiftDay(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getCurrentDateIST())}
      />

      <section className="card">
        <div className="card__body">
          <div className="summary">
            <div className="summary__box">
              <p className="summary__label">Day total</p>
              <p className="summary__value">{formatCurrency(dayTotal)}</p>
            </div>
            <div className="summary__box">
              <p className="summary__label">Day due</p>
              <p className="summary__value danger">{formatCurrency(dayDue)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar__group">
          <button className="button button--secondary" type="button" onClick={() => void load(true)}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {(data?.buyerBills.length ?? 0) === 0 ? (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">No bills on this date</h2>
            <p className="card__subtitle">
              Switch the date to view another day’s bill sheet.
            </p>
          </div>
        </section>
      ) : (
        <div className="list">
          {data?.buyerBills.map((bill) => {
            const dueAmount = Math.max(bill.totalAmount - bill.amountPaid, 0);

            return (
              <article key={bill.id} className="item">
                <div className="item__head">
                  <div>
                    <h2 className="item__title">{bill.billNumber}</h2>
                    <p className="item__meta">
                      {bill.billDate} • {bill.status}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className="item__title">{formatCurrency(bill.totalAmount)}</p>
                    <p className="item__meta danger">Due {formatCurrency(dueAmount)}</p>
                  </div>
                </div>

                <div className="item__body">
                  {bill.items.map((item) => (
                    <div key={item.id} className="row row--spread">
                      <div>
                        <p className="item__title" style={{ fontSize: 15 }}>
                          {item.description}
                        </p>
                        <p className="item__meta">
                          {item.weightKg} kg • {formatCurrency(item.pricePerKg)}
                        </p>
                      </div>
                      <p className="item__title" style={{ fontSize: 15 }}>
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))}

                  <Link className="button button--secondary" href={`/bill/${bill.id}`}>
                    View bill
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
