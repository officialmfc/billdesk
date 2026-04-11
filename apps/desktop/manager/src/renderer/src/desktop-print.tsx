import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ManagerPrintableBillSheet,
  ManagerPrintableCustomerDayLedgerSheet,
  ManagerPrintableCustomerDetailSheet,
  ManagerPrintableDocument,
  ManagerPrintableLineSheet,
  type ManagerBuyerPurchaseCard,
  type ManagerChalanCard,
} from "@mfc/manager-ui";

import type {
  DesktopCustomerBillDetail,
  DesktopCustomerDayLedgerSections,
  DesktopCustomerLedgerPurchaseRow,
  DesktopPrintBusinessConfig,
} from "../../shared/contracts";

type PrintPaper = "a4" | "thermal";

function getPrintPageCss(paper: PrintPaper): string {
  if (paper === "thermal") {
    return `
      @page {
        size: 76mm auto;
        margin: 0;
      }

      html, body {
        width: 76mm;
        margin: 0;
        padding: 0;
      }
    `;
  }

  return `
    @page {
      size: A4 portrait;
      margin: 4mm;
    }

    html, body {
      margin: 0;
      padding: 0;
    }
  `;
}

function formatPrintStatusLabel(status: "due" | "paid" | "partial"): string {
  return status === "partial" ? "Partially paid" : status;
}

function DesktopPrintDocumentFrame({
  business,
  children,
  headerMode,
  paper,
  title,
}: {
  business: DesktopPrintBusinessConfig;
  children: ReactNode;
  headerMode?: "compact" | "full";
  paper: PrintPaper;
  title: string;
}): ReactElement {
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
          boxShadow: paper === "thermal" ? "none" : "0 24px 72px rgba(15,23,42,0.12)",
          padding: paper === "thermal" ? 0 : 4,
        }}
      >
        <ManagerPrintableDocument
          address={business.address}
          businessName={business.name}
          documentTitle={title}
          email={business.email}
          gst={business.gst}
          headerMode={headerMode}
          paper={paper}
          phone={business.phone}
        >
          {children}
        </ManagerPrintableDocument>
      </div>
    </div>
  );
}

let cachedPrintConfig: DesktopPrintBusinessConfig | null = null;

function usePrintBusinessConfig(): DesktopPrintBusinessConfig | null {
  const [config, setConfig] = useState<DesktopPrintBusinessConfig | null>(cachedPrintConfig);

  useEffect(() => {
    if (cachedPrintConfig) {
      return;
    }

    let cancelled = false;
    void window.managerDesktopApi.app
      .getPrintConfig()
      .then((result) => {
        if (cancelled) {
          return;
        }
        cachedPrintConfig = result;
        setConfig(result);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({
            address: "",
            email: "",
            gst: "",
            name: "Mondal Fish Center",
            phone: "",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}

export function DesktopPrintButton({
  children,
  documentTitle,
  headerMode,
  paper = "a4",
  trigger,
}: {
  children: ReactNode;
  documentTitle: string;
  headerMode?: "compact" | "full";
  paper?: PrintPaper;
  trigger: ReactNode;
}): ReactElement {
  const business = usePrintBusinessConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!business || !isPrinting || !printRootRef.current) {
      return;
    }

    let cancelled = false;
    const iframe = document.createElement("iframe");

    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      setIsPrinting(false);
    };

    const run = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (cancelled || !printRootRef.current) {
        cleanup();
        return;
      }

      const iframeDocument = iframe.contentDocument;
      const iframeWindow = iframe.contentWindow;
      if (!iframeDocument || !iframeWindow) {
        cleanup();
        return;
      }

      iframeDocument.open();
      iframeDocument.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${documentTitle}</title>
            <style>
              ${getPrintPageCss(paper)}
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body {
                background: #ffffff;
                color: #0f172a;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              }
              [data-print-frame-outer],
              [data-print-frame-inner] {
                backdrop-filter: none !important;
                box-shadow: none !important;
              }
            </style>
          </head>
          <body>${printRootRef.current.innerHTML}</body>
        </html>
      `);
      iframeDocument.close();

      const finalize = () => {
        iframeWindow.removeEventListener("afterprint", finalize);
        cleanup();
      };

      iframeWindow.addEventListener("afterprint", finalize);

      setTimeout(() => {
        if (cancelled) {
          finalize();
          return;
        }
        iframeWindow.focus();
        iframeWindow.print();
      }, 120);
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [business, documentTitle, headerMode, isPrinting, paper]);

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!business || isPrinting) {
      return;
    }
    setIsPrinting(true);
  };

  let triggerNode: ReactNode;
  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<{
      disabled?: boolean;
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }>;

    triggerNode = cloneElement(element, {
      disabled: !business || isPrinting || element.props.disabled,
      onClick: (event: MouseEvent<HTMLElement>) => {
        element.props.onClick?.(event);
        if (!event.defaultPrevented) {
          handleTriggerClick(event);
        }
      },
    });
  } else {
    triggerNode = (
      <button className="secondary-button" disabled={!business || isPrinting} onClick={handleTriggerClick} type="button">
        Print
      </button>
    );
  }

  return (
    <>
      {triggerNode}
      <div
        aria-hidden="true"
        ref={printRootRef}
        style={{
          left: "-99999px",
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          visibility: "hidden",
          width: paper === "thermal" ? "76mm" : "190mm",
          zIndex: -1,
        }}
      >
        {business ? (
          <DesktopPrintDocumentFrame business={business} headerMode={headerMode} paper={paper} title={documentTitle}>
            {children}
          </DesktopPrintDocumentFrame>
        ) : null}
      </div>
    </>
  );
}

export function DesktopCustomerBillPrintContent({
  bill,
}: {
  bill: DesktopCustomerBillDetail;
}): ReactElement {
  return (
    <ManagerPrintableBillSheet
      billLabel={bill.billNumber}
      customerLabel={bill.businessName || bill.name}
      date={bill.date}
      documentTitle="Customer Bill"
      dueAmount={bill.dueAmount}
      paidAmount={bill.amountPaid}
      rows={bill.lines.map((line) => ({
        amount: line.amount,
        id: line.id,
        label: line.productLabel,
        rate: line.rate,
        serialNo: line.serialNo,
        weight: line.weightKg,
      }))}
      totalAmount={bill.totalAmount}
      totalWeight={bill.totalWeight}
    />
  );
}

export function DesktopBuyerPurchasePrintContent({
  card,
  date,
}: {
  card: ManagerBuyerPurchaseCard;
  date: string;
}): ReactElement {
  return (
    <ManagerPrintableBillSheet
      billLabel={card.billLabel}
      customerLabel={card.businessName || card.name}
      date={date}
      documentTitle="Buyer Bill"
      dueAmount={card.totalDueTillDate}
      paidAmount={card.datePayment}
      rows={card.items.map((item) => ({
        amount: item.amount,
        id: item.id,
        label: item.label,
        rate: item.pricePerKg,
        serialNo: item.serialNo,
        weight: item.weight,
      }))}
      totalAmount={card.totalPurchase}
      totalWeight={card.totalWeight}
    />
  );
}

export function DesktopChalanPrintContent({
  card,
}: {
  card: ManagerChalanCard;
}): ReactElement {
  return (
    <ManagerPrintableLineSheet
      headerMeta={`${card.chalan.chalan_number} • ${new Date(`${card.chalan.chalan_date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`}
      headerTitle={card.sellerName}
      paper="thermal"
      rows={card.rows.map((row) => ({
        amount: row.amount,
        id: row.id,
        label: row.label,
        rate: row.pricePerKg,
        serialNo: row.serialNo,
        weight: row.weight,
      }))}
      status={{ label: formatPrintStatusLabel(card.paymentStatus), tone: card.paymentStatus }}
      summaryRows={[
        {
          label: `Commission (${((card.totals.commission / Math.max(card.totals.totalAmount, 1)) * 100).toFixed(1)}%)`,
          tone: "warning",
          value: card.totals.commission,
        },
        ...(card.paymentStatus === "partial"
          ? [
              { label: "Paid so far", tone: "success" as const, value: card.totals.paid },
              { label: "Remaining", tone: "danger" as const, value: card.totals.due },
            ]
          : []),
        {
          label: "Payable",
          tone: card.totals.netPayable > 0 ? "default" : "success",
          value: card.totals.netPayable,
        },
      ]}
      totalAmount={card.totals.totalAmount}
      totalWeight={card.totals.totalWeight}
    />
  );
}

export function DesktopCustomerDayPrintContent({
  date,
  sections,
}: {
  date: string;
  sections: DesktopCustomerDayLedgerSections;
}): ReactElement {
  return (
    <ManagerPrintableCustomerDayLedgerSheet
      carryForwardRows={sections.dueOnly.map((row) => ({
        id: row.customerId,
        name: row.displayName,
        oldDues: row.olderDues.map((entry) => entry.amount),
        paymentToday: row.paymentToday,
        totalDue: row.outstandingAtClose,
      }))}
      date={date}
      purchasedTodayRows={sections.purchasedToday.map((row) => ({
        id: row.customerId,
        name: row.displayName,
        oldDues: row.olderDues.map((entry) => entry.amount),
        paymentToday: row.paymentToday,
        totalDue: row.outstandingAtClose,
        todayDue: row.todayAmount,
      }))}
    />
  );
}

export function DesktopCustomerDetailPrintContent({
  customerLabel,
  rows,
}: {
  customerLabel: string;
  rows: DesktopCustomerLedgerPurchaseRow[];
}): ReactElement {
  return (
    <ManagerPrintableCustomerDetailSheet
      customerLabel={customerLabel}
      paper="thermal"
      rows={rows.map((row) => ({
        amount: row.totalAmount,
        date: row.date,
        due: row.dueAmount,
        id: row.id,
        paid: row.paidAmount,
      }))}
    />
  );
}
