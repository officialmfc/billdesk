"use client";

import { useMemo } from "react";

import { formatReadableDate } from "@/lib/date";

type Props = {
  dateStr: string;
  onNext: () => void;
  onPrevious: () => void;
  onSelectDate: (value: string) => void;
  onToday: () => void;
};

export function DateNavigator({
  dateStr,
  onNext,
  onPrevious,
  onSelectDate,
  onToday,
}: Props): React.JSX.Element {
  const readable = useMemo(() => formatReadableDate(dateStr), [dateStr]);

  return (
    <div className="card">
      <div className="card__body">
        <div className="toolbar">
          <div className="toolbar__group">
            <button className="button button--secondary" type="button" onClick={onPrevious}>
              ← Prev
            </button>
            <button className="button button--secondary" type="button" onClick={onToday}>
              Today
            </button>
            <button className="button button--secondary" type="button" onClick={onNext}>
              Next →
            </button>
          </div>

          <div className="field" style={{ minWidth: 210 }}>
            <span className="field__label">Day</span>
            <input
              className="input"
              type="date"
              value={dateStr}
              onChange={(event) => onSelectDate(event.target.value)}
            />
          </div>
        </div>

        <p className="field__hint" style={{ marginTop: 10 }}>
          Selected date: <strong>{readable}</strong>
        </p>
      </div>
    </div>
  );
}
