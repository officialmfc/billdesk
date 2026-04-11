"use client";

import { useRef, type CSSProperties } from "react";

const tokens = {
  background: "rgba(255,255,255,0.98)",
  border: "#dbe4ee",
  foreground: "#0f172a",
  primary: "#2563eb",
  shadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
};

type ManagerDateNavigatorProps = {
  dateValue: string;
  onChange: (nextDate: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
};

function formatDateLabel(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const rootStyle: CSSProperties = {
  marginInline: "auto",
  maxWidth: 560,
  position: "relative",
  width: "100%",
};

const shellStyle: CSSProperties = {
  alignItems: "center",
  background: tokens.background,
  border: `1px solid ${tokens.border}`,
  borderRadius: 22,
  boxShadow: tokens.shadow,
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
  padding: "8px 10px",
};

const navButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  borderRadius: 999,
  color: tokens.primary,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 10px",
};

const dateButtonStyle: CSSProperties = {
  ...navButtonStyle,
  color: tokens.foreground,
  fontSize: 15,
  textAlign: "center",
};

const dateFieldWrapStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  justifyContent: "center",
  position: "relative",
};

const hiddenInputStyle: CSSProperties = {
  bottom: 0,
  opacity: 0,
  pointerEvents: "none",
  position: "absolute",
  right: 0,
  top: 0,
  width: "100%",
};

export function ManagerDateNavigator(props: ManagerDateNavigatorProps) {
  const { dateValue, onChange, onNext, onPrevious } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  return (
    <div style={rootStyle}>
      <div style={shellStyle}>
        <button type="button" style={navButtonStyle} onClick={onPrevious}>
          Prev
        </button>
        <div style={dateFieldWrapStyle}>
          <button type="button" style={dateButtonStyle} onClick={openPicker}>
            {formatDateLabel(dateValue)}
          </button>
          <input
            ref={inputRef}
            type="date"
            value={dateValue}
            onChange={(event) => {
              if (!event.target.value) {
                return;
              }

              onChange(event.target.value);
            }}
            style={hiddenInputStyle}
            tabIndex={-1}
          />
        </div>
        <button type="button" style={navButtonStyle} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
