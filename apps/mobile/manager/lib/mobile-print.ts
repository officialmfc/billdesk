import { Platform } from "react-native";
import type {
  BuyerPurchaseCard,
  ChalanVerificationCard,
  CustomerDayLedgerSections,
} from "@/repositories/types";
import type { CustomerBillDetail, CustomerLedgerPurchaseRow } from "@/repositories/types";

import { ErrorHandler } from "@/lib/error-handler";

type ExpoPrintModule = typeof import("expo-print");
type ExpoSharingModule = typeof import("expo-sharing");

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatWeight(value: number): string {
  return `${value.toFixed(2)} kg`;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBusinessConfig() {
  return {
    address:
      process.env.EXPO_PUBLIC_BUSINESS_ADDRESS || "Sriniketan Krisok Bazar ,Bolpur ,Birbhum,W.B. ,731236",
    email: process.env.EXPO_PUBLIC_BUSINESS_EMAIL || "",
    gst: process.env.EXPO_PUBLIC_BUSINESS_GST || "",
    name: process.env.EXPO_PUBLIC_BUSINESS_NAME || "Mondal Fish Center",
    phone: process.env.EXPO_PUBLIC_BUSINESS_PHONE || "",
  };
}

function thermalShell(title: string, body: string): string {
  const business = getBusinessConfig();
  const contactBits = [business.phone, business.email].filter(Boolean).join(" • ");

  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page { size: 80mm auto; margin: 2mm 1.5px; }
        * { box-sizing: border-box; }
        body {
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          margin: 0;
          padding: 0 1.5px;
          width: 100%;
        }
        .sheet { width: 100%; }
        .header { padding: 2px 0 8px; text-align: center; }
        .biz-name { font-size: 21px; font-weight: 800; line-height: 1.05; }
        .muted { color: #64748b; font-size: 10px; line-height: 1.35; }
        .title { font-size: 15px; font-weight: 800; letter-spacing: 0.08em; margin-top: 6px; text-transform: uppercase; }
        .meta-row,
        .customer-row { display: flex; gap: 8px; justify-content: space-between; margin-top: 8px; }
        .customer-row { align-items: center; }
        .customer-name { font-size: 15px; font-weight: 700; text-align: center; width: 100%; }
        .meta-label { color: #64748b; font-size: 10px; text-transform: uppercase; }
        .meta-value { font-size: 12px; font-weight: 700; }
        table { border-collapse: collapse; margin-top: 8px; width: 100%; }
        th, td { border-bottom: 1px solid #dbe4ee; padding: 8px 3px; vertical-align: top; }
        th {
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-align: left;
          text-transform: uppercase;
        }
        td { font-size: 12px; }
        .right { text-align: right; }
        .center { text-align: center; }
        .strong { font-weight: 700; }
        .summary {
          display: grid;
          gap: 4px;
          margin-top: 8px;
        }
        .summary-row {
          align-items: center;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .summary-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .success { color: #15803d; font-weight: 700; }
        .danger { color: #dc2626; font-weight: 700; }
        .warning { color: #b45309; font-weight: 700; }
        .badge {
          border-radius: 999px;
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          text-transform: capitalize;
        }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-due { background: #fee2e2; color: #dc2626; }
        .badge-partial { background: #fef3c7; color: #b45309; }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div class="biz-name">${escapeHtml(business.name)}</div>
          ${business.address ? `<div class="muted">${escapeHtml(business.address)}</div>` : ""}
          ${contactBits ? `<div class="muted">${escapeHtml(contactBits)}</div>` : ""}
          ${business.gst ? `<div class="muted">GST: ${escapeHtml(business.gst)}</div>` : ""}
          <div class="title">${escapeHtml(title)}</div>
        </div>
        ${body}
      </div>
    </body>
  </html>`;
}

function a4Shell(title: string, subtitle: string, body: string): string {
  const business = getBusinessConfig();
  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page { size: A4 portrait; margin: 6mm 5mm; }
        * { box-sizing: border-box; }
        body {
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          margin: 0;
          padding: 0;
        }
        .sheet { width: 100%; }
        .header {
          align-items: end;
          border-bottom: 1px dotted #cbd5e1;
          display: flex;
          justify-content: space-between;
          padding-bottom: 6px;
        }
        .biz-name { font-size: 24px; font-weight: 800; line-height: 1.05; }
        .title { color: #64748b; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
        .subtitle {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          margin-top: 8px;
          text-transform: uppercase;
        }
        .section-title {
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          margin: 14px 0 6px;
          text-transform: uppercase;
        }
        table { border: 1px dotted #cbd5e1; border-collapse: collapse; width: 100%; }
        th, td {
          border-bottom: 1px dotted #dbe4ee;
          border-right: 1px dotted #dbe4ee;
          font-size: 10px;
          padding: 5px 6px;
          vertical-align: top;
        }
        th:last-child, td:last-child { border-right: 0; }
        tr:last-child td { border-bottom: 0; }
        th {
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-align: left;
          text-transform: uppercase;
        }
        .right { text-align: right; }
        .danger { color: #dc2626; font-weight: 700; }
        .success { color: #15803d; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div class="biz-name">${escapeHtml(business.name)}</div>
          <div class="title">${escapeHtml(title)}</div>
        </div>
        <div class="subtitle">${escapeHtml(subtitle)}</div>
        ${body}
      </div>
    </body>
  </html>`;
}

function renderThermalBill(params: {
  billLabel: string;
  customerLabel: string;
  date: string;
  documentTitle: string;
  dueAmount: number;
  paidAmount: number;
  rows: Array<{
    amount: number;
    label: string;
    rate: number;
    serialNo: number;
    weight: number;
  }>;
  totalAmount: number;
  totalWeight: number;
}): string {
  return thermalShell(
    params.documentTitle,
    `
    <div class="meta-row">
      <div>
        <div class="meta-label">Bill No</div>
        <div class="meta-value">${escapeHtml(params.billLabel)}</div>
      </div>
      <div class="right">
        <div class="meta-label">Date</div>
        <div class="meta-value">${escapeHtml(formatDate(params.date))}</div>
      </div>
    </div>
    <div class="customer-row">
      <div class="customer-name">${escapeHtml(params.customerLabel)}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 9%">Sl</th>
          <th style="width: 36%">Item</th>
          <th class="right" style="width: 18%">Weight</th>
          <th class="right" style="width: 16%">Rate</th>
          <th class="right" style="width: 21%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${params.rows
          .map(
            (row) => `
            <tr>
              <td>${row.serialNo}</td>
              <td class="strong">${escapeHtml(row.label)}</td>
              <td class="right">${escapeHtml(formatWeight(row.weight))}</td>
              <td class="right">${escapeHtml(formatCurrency(row.rate))}</td>
              <td class="right strong">${escapeHtml(formatCurrency(row.amount))}</td>
            </tr>`
          )
          .join("")}
        <tr>
          <td></td>
          <td></td>
          <td class="right strong">${escapeHtml(formatWeight(params.totalWeight))}</td>
          <td></td>
          <td class="right strong">${escapeHtml(formatCurrency(params.totalAmount))}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-row">
        <div class="summary-label">Paid</div>
        <div class="success">${escapeHtml(formatCurrency(params.paidAmount))}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Due</div>
        <div class="danger">${escapeHtml(formatCurrency(params.dueAmount))}</div>
      </div>
    </div>
  `
  );
}

function renderThermalChalan(card: ChalanVerificationCard): string {
  const totalWeight = card.rows.reduce((sum, row) => sum + row.weight, 0);
  const totalAmount = card.rows.reduce((sum, row) => sum + row.amount, 0);
  const statusClass =
    card.paymentStatus === "paid"
      ? "badge-paid"
      : card.paymentStatus === "partial"
        ? "badge-partial"
        : "badge-due";

  const commissionPercentage =
    totalAmount > 0 ? ((card.totals.commission / totalAmount) * 100).toFixed(1) : "0.0";

  return thermalShell(
    "Seller Chalan",
    `
    <div class="customer-row">
      <div class="meta-value">${escapeHtml(card.sellerName)}</div>
      <div class="badge ${statusClass}">${escapeHtml(card.paymentStatus === "partial" ? "Partial" : card.paymentStatus)}</div>
    </div>
    <div class="meta-row" style="margin-top:4px;">
      <div></div>
      <div class="right">
        <div class="meta-value">${escapeHtml(card.chalan.chalan_number)} • ${escapeHtml(formatDate(card.chalan.chalan_date))}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 9%">Sl</th>
          <th style="width: 36%">Item</th>
          <th class="right" style="width: 18%">Weight</th>
          <th class="right" style="width: 16%">Rate</th>
          <th class="right" style="width: 21%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${card.rows
          .map(
            (row) => `
            <tr>
              <td>${row.serialNo}</td>
              <td class="strong">${escapeHtml(row.label)}</td>
              <td class="right">${escapeHtml(formatWeight(row.weight))}</td>
              <td class="right">${escapeHtml(formatCurrency(row.pricePerKg))}</td>
              <td class="right strong">${escapeHtml(formatCurrency(row.amount))}</td>
            </tr>`
          )
          .join("")}
        <tr>
          <td></td>
          <td></td>
          <td class="right strong">${escapeHtml(formatWeight(totalWeight))}</td>
          <td></td>
          <td class="right strong">${escapeHtml(formatCurrency(totalAmount))}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-row">
        <div class="summary-label">Commission (${escapeHtml(commissionPercentage)}%)</div>
        <div class="warning">${escapeHtml(formatCurrency(card.totals.commission))}</div>
      </div>
      ${
        card.paymentStatus === "partial"
          ? `
          <div class="summary-row">
            <div class="summary-label">Paid so far</div>
            <div class="success">${escapeHtml(formatCurrency(card.totals.paid))}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Remaining</div>
            <div class="danger">${escapeHtml(formatCurrency(card.totals.due))}</div>
          </div>
        `
          : ""
      }
      <div class="summary-row">
        <div class="summary-label">Payable</div>
        <div class="strong">${escapeHtml(formatCurrency(card.totals.netPayable))}</div>
      </div>
    </div>
  `
  );
}

function renderCustomerDayLedger(date: string, sections: CustomerDayLedgerSections): string {
  const purchasedTable = `
    <div class="section-title">Purchased Today</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35%">Name</th>
          <th style="width: 15%">Old</th>
          <th style="width: 15%">Today</th>
          <th style="width: 17%">Total Due</th>
          <th style="width: 18%">Payment</th>
        </tr>
      </thead>
      <tbody>
        ${
          sections.purchasedToday.length
            ? sections.purchasedToday
                .map(
                  (row) => `
                  <tr>
                    <td><strong>${escapeHtml(row.displayName)}</strong></td>
                    <td>${escapeHtml(
                      row.olderDues.length ? row.olderDues.map((entry) => formatCurrency(entry.amount)).join(" / ") : "-"
                    )}</td>
                    <td class="right">${row.todayAmount > 0 ? escapeHtml(formatCurrency(row.todayAmount)) : "-"}</td>
                    <td class="right danger">${escapeHtml(formatCurrency(row.outstandingAtClose))}</td>
                    <td class="right success">${row.paymentToday > 0 ? escapeHtml(formatCurrency(row.paymentToday)) : "-"}</td>
                  </tr>`
                )
                .join("")
            : `<tr><td colspan="5">No customer purchases for this date.</td></tr>`
        }
      </tbody>
    </table>
  `;

  const carryTable = `
    <div class="section-title">Due, No Purchase Today</div>
    <table>
      <thead>
        <tr>
          <th style="width: 40%">Name</th>
          <th style="width: 20%">Old</th>
          <th style="width: 20%">Total Due</th>
          <th style="width: 20%">Payment</th>
        </tr>
      </thead>
      <tbody>
        ${
          sections.dueOnly.length
            ? sections.dueOnly
                .map(
                  (row) => `
                  <tr>
                    <td><strong>${escapeHtml(row.displayName)}</strong></td>
                    <td>${escapeHtml(
                      row.olderDues.length ? row.olderDues.map((entry) => formatCurrency(entry.amount)).join(" / ") : "-"
                    )}</td>
                    <td class="right danger">${escapeHtml(formatCurrency(row.outstandingAtClose))}</td>
                    <td class="right success">${row.paymentToday > 0 ? escapeHtml(formatCurrency(row.paymentToday)) : "-"}</td>
                  </tr>`
                )
                .join("")
            : `<tr><td colspan="4">No carry-forward due below this date.</td></tr>`
        }
      </tbody>
    </table>
  `;

  return a4Shell("Ledger Sheet", `Customer day ledger · ${formatDate(date)}`, `${purchasedTable}${carryTable}`);
}

function renderCustomerDetail(customerLabel: string, rows: CustomerLedgerPurchaseRow[]): string {
  return thermalShell(
    "Customer Ledger",
    `
    <div class="customer-row">
      <div class="customer-name">${escapeHtml(customerLabel)}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 30%">Date</th>
          <th class="right" style="width: 23%">Amount</th>
          <th class="right" style="width: 23%">Paid</th>
          <th class="right" style="width: 24%">Due</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows
                .map(
                  (row) => `
                  <tr>
                    <td>${escapeHtml(formatDate(row.date))}</td>
                    <td class="right">${escapeHtml(formatCurrency(row.totalAmount))}</td>
                    <td class="right success">${escapeHtml(formatCurrency(row.paidAmount))}</td>
                    <td class="right danger">${escapeHtml(formatCurrency(row.dueAmount))}</td>
                  </tr>`
                )
                .join("")
            : `<tr><td colspan="4">No bill rows found for this customer.</td></tr>`
        }
      </tbody>
    </table>
  `
  );
}

async function printHtml(html: string): Promise<void> {
  if (Platform.OS === "web") {
    ErrorHandler.showInfo("Use the web manager print actions on web.");
    return;
  }

  try {
    const Print = require("expo-print") as ExpoPrintModule;
    await Print.printAsync({ html });
  } catch (error) {
    try {
      const Print = require("expo-print") as ExpoPrintModule;
      const Sharing = require("expo-sharing") as ExpoSharingModule;
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: ".pdf",
        });
        return;
      }
    } catch {
      // fall through to final handler below
    }

    ErrorHandler.handle(error, "Print");
  }
}

export async function printCustomerBillSheet(bill: CustomerBillDetail): Promise<void> {
  await printHtml(
    renderThermalBill({
      billLabel: bill.billNumber,
      customerLabel: bill.businessName || bill.name,
      date: bill.date,
      documentTitle: "Customer Bill",
      dueAmount: bill.dueAmount,
      paidAmount: bill.amountPaid,
      rows: bill.lines.map((line) => ({
        amount: line.amount,
        label: line.productLabel,
        rate: line.rate,
        serialNo: line.serialNo,
        weight: line.weightKg,
      })),
      totalAmount: bill.totalAmount,
      totalWeight: bill.totalWeight,
    })
  );
}

export async function printBuyerPurchaseBill(card: BuyerPurchaseCard, date: string): Promise<void> {
  await printHtml(
    renderThermalBill({
      billLabel: card.billLabel,
      customerLabel: card.businessName || card.name,
      date,
      documentTitle: "Buyer Bill",
      dueAmount: card.totalDueTillDate,
      paidAmount: card.datePayment,
      rows: card.items.map((item) => ({
        amount: item.amount,
        label: item.label,
        rate: item.pricePerKg,
        serialNo: item.serialNo,
        weight: item.weight,
      })),
      totalAmount: card.totalPurchase,
      totalWeight: card.totalWeight,
    })
  );
}

export async function printChalanSheet(card: ChalanVerificationCard): Promise<void> {
  await printHtml(renderThermalChalan(card));
}

export async function printCustomerDayLedgerSheet(
  date: string,
  sections: CustomerDayLedgerSections
): Promise<void> {
  await printHtml(renderCustomerDayLedger(date, sections));
}

export async function printCustomerLedgerDetailSheet(
  customerLabel: string,
  rows: CustomerLedgerPurchaseRow[]
): Promise<void> {
  await printHtml(renderCustomerDetail(customerLabel, rows));
}
