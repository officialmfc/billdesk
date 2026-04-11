"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useUserApp } from "@/components/providers/user-app-provider";
import { formatCurrency } from "@/lib/format";
import { getUserBillDetail, syncCurrentUserData, type UserBillDetail } from "@/lib/user-api";

export default function BillDetailPage(): React.JSX.Element {
  const params = useParams<{ billId?: string }>();
  const billId = Array.isArray(params.billId) ? params.billId[0] : params.billId;
  const { profile } = useUserApp();
  const [bill, setBill] = useState<UserBillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id || !billId) {
        return;
      }

      setLoading(true);
      setBill(await getUserBillDetail(profile.id, billId));

      try {
        await syncCurrentUserData();
        setBill(await getUserBillDetail(profile.id, billId));
      } catch {
        // Keep cached bill detail visible.
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [billId, profile?.id]);

  if (loading) {
    return (
      <section className="card">
        <div className="card__body loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Loading bill...</p>
        </div>
      </section>
    );
  }

  if (!bill) {
    return (
      <section className="card">
        <div className="card__body stack">
          <h1 className="card__title">Bill not found</h1>
          <p className="card__subtitle">
            The selected bill could not be loaded on this device.
          </p>
          <Link className="button button--secondary" href="/bills">
            Back to Bills
          </Link>
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
            <h1 className="hero__title">{bill.billNumber}</h1>
            <p className="hero__subtitle">
              {bill.billDate} • {bill.status}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__body stack">
          {bill.lines.map((line) => (
            <div key={line.id} className="row row--spread">
              <div>
                <p className="item__title">{line.serialNo}. {line.description}</p>
                <p className="item__meta">
                  {line.weightKg.toFixed(2)} kg • {formatCurrency(line.pricePerKg)}
                </p>
              </div>
              <p className="item__title">{formatCurrency(line.amount)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card__body">
          <div className="summary">
            <div className="summary__box">
              <p className="summary__label">Weight</p>
              <p className="summary__value">{bill.totalWeight.toFixed(2)} kg</p>
            </div>
            <div className="summary__box">
              <p className="summary__label">Total</p>
              <p className="summary__value">{formatCurrency(bill.totalAmount)}</p>
            </div>
            <div className="summary__box">
              <p className="summary__label">Paid</p>
              <p className="summary__value success">{formatCurrency(bill.amountPaid)}</p>
            </div>
            <div className="summary__box">
              <p className="summary__label">Due</p>
              <p className="summary__value danger">{formatCurrency(bill.dueAmount)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
