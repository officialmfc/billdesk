"use client";

import { useEffect, useMemo, useState } from "react";

import { DateNavigator } from "@/components/date-navigator";
import { useUserApp } from "@/components/providers/user-app-provider";
import { formatCurrency } from "@/lib/format";
import {
  getCurrentDateIST,
  shiftDay,
} from "@/lib/date";
import {
  getUserHistory,
  getUserTodayData,
  syncCurrentUserData,
  type UserHistoryRow,
  type UserTodayData,
} from "@/lib/user-api";

export default function SellerPage(): React.JSX.Element {
  const { profile, sellerSectionEnabled } = useUserApp();
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [mode, setMode] = useState<"day" | "history">("day");
  const [data, setData] = useState<UserTodayData | null>(null);
  const [historyRows, setHistoryRows] = useState<UserHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refreshRemote = true) => {
    if (!profile?.id) {
      return;
    }

    setRefreshing(true);
    try {
      setData(await getUserTodayData(profile.id, dateStr));
      setHistoryRows(await getUserHistory(profile.id));

      if (refreshRemote) {
        try {
          await syncCurrentUserData();
          setData(await getUserTodayData(profile.id, dateStr));
          setHistoryRows(await getUserHistory(profile.id));
        } catch {
          // Keep cached seller data visible.
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

  const sellerHistoryRows = useMemo(
    () => historyRows.filter((row) => row.kind === "chalan" || row.kind === "payout"),
    [historyRows]
  );

  const dayPayable = useMemo(
    () => (data?.sellerChalans ?? []).reduce((sum, chalan) => sum + chalan.netPayable, 0),
    [data?.sellerChalans]
  );

  if (loading) {
    return (
      <section className="card">
        <div className="card__body loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Loading seller section...</p>
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
            <h1 className="hero__title">Seller</h1>
            <p className="hero__subtitle">
              {sellerSectionEnabled
                ? "Seller-side chalans and payouts."
                : "Hidden until you enable it in Settings."}
            </p>
          </div>
        </div>
      </section>

      {!sellerSectionEnabled ? (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Seller section hidden</h2>
            <p className="card__subtitle">
              Open Settings and turn on the seller section when you need it.
            </p>
          </div>
        </section>
      ) : null}

      <div className="toolbar">
        <div className="toolbar__group">
          <button className={`nav-chip ${mode === "day" ? "nav-chip--active" : ""}`} type="button" onClick={() => setMode("day")}>
            Day
          </button>
          <button className={`nav-chip ${mode === "history" ? "nav-chip--active" : ""}`} type="button" onClick={() => setMode("history")}>
            History
          </button>
        </div>
        <div className="toolbar__group">
          <button className="button button--secondary" type="button" onClick={() => void load(true)}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {mode === "day" ? (
        <>
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
                  <p className="summary__label">Day payable</p>
                  <p className="summary__value">{formatCurrency(dayPayable)}</p>
                </div>
                <div className="summary__box">
                  <p className="summary__label">Chalans</p>
                  <p className="summary__value">{data?.sellerChalans.length ?? 0}</p>
                </div>
              </div>
            </div>
          </section>

          {(data?.sellerChalans.length ?? 0) === 0 ? (
            <section className="card">
              <div className="card__body">
                <h2 className="card__title">No chalans on this date</h2>
                <p className="card__subtitle">
                  Switch the date to view another seller day sheet.
                </p>
              </div>
            </section>
          ) : (
            <div className="list">
              {data?.sellerChalans.map((chalan) => (
                <article key={chalan.id} className="item">
                  <div className="item__head">
                    <div>
                      <h2 className="item__title">{chalan.chalanNumber}</h2>
                      <p className="item__meta">
                        {chalan.chalanDate} • {chalan.status}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="item__title">{formatCurrency(chalan.netPayable)}</p>
                      <p className="item__meta success">Paid {formatCurrency(chalan.amountPaid)}</p>
                    </div>
                  </div>

                  <div className="item__body">
                    {chalan.items.map((item) => (
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : sellerHistoryRows.length === 0 ? (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">No seller history</h2>
            <p className="card__subtitle">
              Seller payments and chalans will appear here when available.
            </p>
          </div>
        </section>
      ) : (
        <div className="list">
          {sellerHistoryRows.map((row) => (
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
