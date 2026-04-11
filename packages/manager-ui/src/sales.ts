export type ManagerSaleFlowKey = "auction" | "direct" | "batch" | "floor";

export type ManagerDesktopSaleViewKey = "hub" | ManagerSaleFlowKey;

export interface ManagerSaleFlowDefinition {
  key: ManagerSaleFlowKey;
  label: string;
  desktopHref: string;
  mobileHref: string;
  desktopView: ManagerDesktopSaleViewKey;
  hubTitle: string;
  hubDescription: string;
  hubMeta: string;
  mobileScreenTitle: string;
  mobileScreenSubtitle: string;
  entryTitle: string;
}

export const managerSalesHubSubtitle = "Choose the right entry flow for the day";

export const managerSalesHubOperationsPrompt =
  "Open the Bill & Chalan desk to review dues, chalans, and buyer activity before entering new sales.";

export const managerSaleFlowDefinitions: readonly ManagerSaleFlowDefinition[] = [
  {
    key: "auction",
    label: "Auction Sale",
    desktopHref: "/sales/auction/new",
    mobileHref: "/auction/new",
    desktopView: "auction",
    hubTitle: "Auction Sale",
    hubDescription: "Record a fresh auction with one seller and multiple buyer lines.",
    hubMeta: "Seller-led chalan workflow",
    mobileScreenTitle: "Auction Sale",
    mobileScreenSubtitle: "Seller-led fresh auction",
    entryTitle: "Auction Sale Entry",
  },
  {
    key: "direct",
    label: "POS Sale",
    desktopHref: "/sales/mfc/pos/new",
    mobileHref: "/mfc/single/new",
    desktopView: "direct",
    hubTitle: "POS / Single Customer",
    hubDescription: "Sell existing stock to one buyer with one consolidated bill.",
    hubMeta: "Direct customer sale",
    mobileScreenTitle: "POS / Single Customer",
    mobileScreenSubtitle: "One buyer, multiple stock lines",
    entryTitle: "POS Sale Entry",
  },
  {
    key: "batch",
    label: "Batch Sale",
    desktopHref: "/sales/mfc/batch/new",
    mobileHref: "/mfc/batch/new",
    desktopView: "batch",
    hubTitle: "Batch Sale",
    hubDescription: "Move one MFC seller's stock to multiple buyers in a single run.",
    hubMeta: "Batch outflow",
    mobileScreenTitle: "Batch Sale",
    mobileScreenSubtitle: "One seller, multiple buyers",
    entryTitle: "Seller Batch Sale Entry",
  },
  {
    key: "floor",
    label: "Floor Sale",
    desktopHref: "/sales/mfc/floor/new",
    mobileHref: "/floor/new",
    desktopView: "floor",
    hubTitle: "Floor Sale",
    hubDescription: "Handle mixed walk-in or floor sales across buyers and sellers.",
    hubMeta: "Multi-line quick sale",
    mobileScreenTitle: "Floor Sale",
    mobileScreenSubtitle: "Mixed quick-sale entry",
    entryTitle: "Quick Floor Sale Entry",
  },
] as const;

export const managerDesktopSaleHrefByView = {
  hub: "/sales",
  auction: "/sales/auction/new",
  direct: "/sales/mfc/pos/new",
  batch: "/sales/mfc/batch/new",
  floor: "/sales/mfc/floor/new",
} as const satisfies Record<ManagerDesktopSaleViewKey, string>;

export const managerDesktopSaleViewByHref = Object.fromEntries(
  Object.entries(managerDesktopSaleHrefByView).map(([view, href]) => [href, view])
) as Record<string, ManagerDesktopSaleViewKey | undefined>;

export function getManagerSaleFlowDefinition(
  key: ManagerSaleFlowKey
): ManagerSaleFlowDefinition {
  const flow = managerSaleFlowDefinitions.find((item) => item.key === key);
  if (!flow) {
    throw new Error(`Unknown manager sale flow: ${key}`);
  }
  return flow;
}
