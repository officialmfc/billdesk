"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useUserApp } from "@/components/providers/user-app-provider";
import { formatCurrency } from "@/lib/format";
import {
  getUserHistory,
  syncCurrentUserData,
  type UserHistoryRow,
} from "@/lib/user-api";

export default function HistoryPage(): React.JSX.Element {
  const { profile } = useUserApp();
  const [rows, setRows] = useState<UserHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refreshRemote = true) => {
    if (!profile?.id) {
      return;
    }

    setRefreshing(true);
    try {
      setRows(await getUserHistory(profile.id));

      if (refreshRemote) {
        try {
          await syncCurrentUserData();
          setRows(await getUserHistory(profile.id));
        } catch {
          // Keep the cached history visible when refresh fails.
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
  }, [profile?.id]);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.kind === "bill" || row.kind === "payment"),
    [rows]
  );

  if (loading) {
    return (
      <section className="card">
        <div className="card__body loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Loading history...</p>
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
            <h1 className="hero__title">History</h1>
            <p className="hero__subtitle">
              Purchase and payment history with direct bill links.
            </p>
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

      {filteredRows.length === 0 ? (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">No history yet</h2>
            <p className="card__subtitle">
              Bills and payments will appear here once your account has activity.
            </p>
          </div>
        </section>
      ) : (
        <div className="list">
          {filteredRows.map((row) => (
            <article key={`${row.kind}-${row.reference}-${row.date}`} className="item">
              <div className="item__head">
                <div>
                  <h2 className="item__title">{row.reference}</h2>
                  <p className="item__meta">
                    {row.date} • {row.kind}
                  </p>
                </div>
                <p className="item__title" style={{ fontSize: 18 }}>
                  {formatCurrency(row.amount)}
                </p>
              </div>

              <div className="item__body">
                {row.billId ? (
                  <Link className="button button--secondary" href={`/bill/${row.billId}`}>
                    Open bill
                  </Link>
                ) : (
                  <span className="chip chip--neutral">Non-bill activity</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
