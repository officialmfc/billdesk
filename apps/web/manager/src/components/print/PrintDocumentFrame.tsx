"use client";

import { ManagerPrintableDocument } from "@mfc/manager-ui";
import type { ReactNode } from "react";

import { getBusinessPrintConfig } from "@/lib/business-print";

export function PrintDocumentFrame({
  children,
  headerMode,
  paper = "a4",
  title,
}: {
  children: ReactNode;
  headerMode?: "compact" | "full";
  paper?: "a4" | "thermal";
  title: string;
}): React.ReactElement {
  const business = getBusinessPrintConfig();

  return (
    <div
      data-print-frame-outer
      style={{
        margin: "0 auto",
        maxWidth: paper === "thermal" ? "76mm" : "202mm",
        width: "100%",
      }}
    >
      <div
        data-print-frame-inner
        style={{
          backdropFilter: "blur(6px)",
          background: "rgba(255,255,255,0.92)",
          border: paper === "thermal" ? "none" : "1px solid rgba(226,232,240,0.85)",
          borderRadius: paper === "thermal" ? 0 : 24,
          boxShadow:
            paper === "thermal"
              ? "none"
              : "0 24px 72px rgba(15, 23, 42, 0.12)",
          padding: paper === "thermal" ? 0 : 4,
        }}
      >
        <ManagerPrintableDocument
          businessName={business.name}
          address={business.address}
          email={business.email}
          gst={business.gst}
          headerMode={headerMode}
          paper={paper}
          phone={business.phone}
          documentTitle={title}
        >
          {children}
        </ManagerPrintableDocument>
      </div>
    </div>
  );
}
