import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Boxes,
  BookCopy,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Gavel,
  Layers3,
  LayoutDashboard,
  Loader2,
  LogOut,
  PackagePlus,
  Plus,
  PlusCircle,
  RefreshCw,
  ReceiptText,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  getManagerSaleFlowDefinition,
  managerDesktopNavigationGroups,
  managerDesktopSaleHrefByView,
  managerDesktopSaleViewByHref,
  managerSaleFlowDefinitions,
  type ManagerDesktopSaleViewKey,
  type ManagerSaleFlowKey,
} from "@mfc/manager-ui";
import { cn } from "@mfc/utils";

import type {
  BatchSaleItemInput,
  DirectSaleItemInput,
  FloorSaleItemInput,
  SaleFormLookups,
  SelectionOption,
  StaffProfile,
  StockBatchOption,
  SyncStatus,
} from "../../shared/contracts";
import {
  DesktopProductsPage,
  DesktopQuotesPage,
  DesktopSettingsPage,
  DesktopStockPage,
  DesktopUsersPage,
} from "./admin-pages";
import { getDesktopLandingPreference } from "./desktop-preferences";
import type { DesktopLocalSecuritySnapshot } from "./local-security";
import { getDesktopLocalSecuritySnapshot } from "./local-security";
import { DesktopLocalSecurityLock, DesktopLocalSecuritySetup } from "./local-security-ui";
import {
  DesktopCustomerBillPage,
  DesktopCustomerDayLedgerPage,
  DesktopCustomerLedgerDetailPage,
  DesktopCustomerLedgerHistoryPage,
  DesktopLedgersOverviewPage,
  DesktopSellerDayLedgerPage,
  DesktopSellerLedgerHistoryPage,
} from "./ledgers-pages";
import {
  DesktopBuyerPurchasesPage,
  DesktopChalanVerificationPage,
  DesktopDailyChalansPage,
  DesktopDueCollectionPage,
  DesktopOperationsOverviewPage,
  DesktopPaymentsPage,
} from "./operations-payments-pages";

type ViewKey =
  | ManagerDesktopSaleViewKey
  | "ledgers-overview"
  | "ledgers-customers-day"
  | "ledgers-customers-detail"
  | "ledgers-customers-history"
  | "ledgers-customers-bill"
  | "ledgers-sellers-day"
  | "ledgers-sellers-history"
  | "operations"
  | "due-collection"
  | "chalans"
  | "buyer-purchases"
  | "verification"
  | "payments"
  | "spendings"
  | "quotes"
  | "users"
  | "products"
  | "stock"
  | "settings";

type DesktopRouteState = {
  view: ViewKey;
  customerLedgerUserId: string | null;
  customerLedgerBillId: string | null;
  sellerLedgerUserId: string | null;
};

type AuctionLineDraft = {
  id: string;
  buyerId: string;
  productDescription: string;
  weight: string;
  rate: string;
};

type StockLineDraft = {
  id: string;
  buyerId: string;
  sellerId: string;
  batchId: string;
  productId: string;
  weight: string;
  rate: string;
};

const desktopNavIconsByHref: Record<string, typeof LayoutDashboard> = {
  "/sales": ShoppingCart,
  "/sales/auction/new": Gavel,
  "/sales/mfc/pos/new": Store,
  "/sales/mfc/batch/new": Users,
  "/sales/mfc/floor/new": Zap,
  "/operations": CalendarDays,
  "/operations/due-collection": Wallet,
  "/operations/chalans": ReceiptText,
  "/operations/buyer-purchases": Users,
  "/operations/chalan-verification": ShieldCheck,
  "/payments": Banknote,
  "/payments/spendings": Wallet,
  "/ledgers": BookCopy,
  "/ledgers/customers/day": BookCopy,
  "/ledgers/customers/detail": BookCopy,
  "/ledgers/customers/history": BookCopy,
  "/ledgers/customers/bill": BookCopy,
  "/ledgers/sellers/day": BookCopy,
  "/ledgers/sellers/history": BookCopy,
  "/quotes": ClipboardList,
  "/approvals": UserCheck,
  "/users": Users,
  "/products": ShoppingBag,
  "/stock": PackagePlus,
  "/settings": Settings,
  "/dashboard": LayoutDashboard,
} as const;

const saleHubIconByFlow: Record<ManagerSaleFlowKey, typeof CircleDollarSign> = {
  auction: CircleDollarSign,
  direct: ShoppingBag,
  batch: Layers3,
  floor: Boxes,
};

const desktopViewHrefByKey: Record<ViewKey, string> = {
  ...managerDesktopSaleHrefByView,
  "ledgers-overview": "/ledgers",
  "ledgers-customers-day": "/ledgers/customers/day",
  "ledgers-customers-detail": "/ledgers/customers/detail",
  "ledgers-customers-history": "/ledgers/customers/history",
  "ledgers-customers-bill": "/ledgers/customers/bill",
  "ledgers-sellers-day": "/ledgers/sellers/day",
  "ledgers-sellers-history": "/ledgers/sellers/history",
  operations: "/operations",
  "due-collection": "/operations/due-collection",
  chalans: "/operations/chalans",
  "buyer-purchases": "/operations/buyer-purchases",
  verification: "/operations/chalan-verification",
  payments: "/payments",
  spendings: "/payments/spendings",
  quotes: "/quotes",
  users: "/users",
  products: "/products",
  stock: "/stock",
  settings: "/settings",
};

const desktopViewByHref: Record<string, ViewKey | undefined> = {
  ...managerDesktopSaleViewByHref,
  "/dashboard": "hub",
  "/ledgers": "ledgers-overview",
  "/ledgers/customers/day": "ledgers-customers-day",
  "/ledgers/customers/detail": "ledgers-customers-detail",
  "/ledgers/customers/history": "ledgers-customers-history",
  "/ledgers/customers/bill": "ledgers-customers-bill",
  "/ledgers/sellers/day": "ledgers-sellers-day",
  "/ledgers/sellers/history": "ledgers-sellers-history",
  "/operations": "operations",
  "/operations/due-collection": "due-collection",
  "/operations/chalans": "chalans",
  "/operations/buyer-purchases": "buyer-purchases",
  "/operations/chalan-verification": "verification",
  "/payments": "payments",
  "/payments/spendings": "spendings",
  "/quotes": "quotes",
  "/users": "users",
  "/products": "products",
  "/stock": "stock",
  "/settings": "settings",
};

function getLandingView(): ViewKey {
  return desktopViewByHref[getDesktopLandingPreference()] ?? "hub";
}

function getDesktopNavItemScore(
  item: (typeof managerDesktopNavigationGroups)[number]["items"][number],
  href: string
): number {
  if (item.href === href) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.max(
    -1,
    ...(item.matchPrefixes ?? [])
      .filter((prefix) => href === prefix || href.startsWith(`${prefix}/`))
      .map((prefix) => prefix.length)
  );
}

function createAuctionLine(): AuctionLineDraft {
  return {
    id: crypto.randomUUID(),
    buyerId: "",
    productDescription: "",
    weight: "",
    rate: "",
  };
}

function createStockLine(): StockLineDraft {
  return {
    id: crypto.randomUUID(),
    buyerId: "",
    sellerId: "",
    batchId: "",
    productId: "",
    weight: "",
    rate: "",
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function focusInputElement(input: HTMLInputElement | null | undefined): void {
  if (!input) {
    return;
  }

  window.setTimeout(() => {
    input.focus();
    input.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, 30);
}

function getSelectedLabel(options: SelectionOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? "";
}

function filterOptions(options: SelectionOption[], query: string): SelectionOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options.slice(0, 12);
  }

  return [...options]
    .sort((left, right) => {
      const leftText = `${left.label} ${left.description ?? ""} ${left.meta ?? ""}`.toLowerCase();
      const rightText = `${right.label} ${right.description ?? ""} ${right.meta ?? ""}`.toLowerCase();
      const leftStarts = leftText.startsWith(normalized) ? 0 : 1;
      const rightStarts = rightText.startsWith(normalized) ? 0 : 1;
      const leftIncludes = leftText.includes(normalized) ? 0 : 1;
      const rightIncludes = rightText.includes(normalized) ? 0 : 1;
      return leftStarts - rightStarts || leftIncludes - rightIncludes || left.label.localeCompare(right.label);
    })
    .filter((option) => {
      const text = `${option.label} ${option.description ?? ""} ${option.meta ?? ""}`.toLowerCase();
      return text.includes(normalized);
    })
    .slice(0, 12);
}

function isAuctionLineValid(line: AuctionLineDraft): boolean {
  return Boolean(line.buyerId && line.productDescription.trim() && Number(line.weight) > 0 && Number(line.rate) > 0);
}

function isDirectLineValid(line: StockLineDraft): boolean {
  return Boolean(line.sellerId && line.batchId && line.productId && Number(line.weight) > 0 && Number(line.rate) > 0);
}

function isBatchLineValid(line: StockLineDraft): boolean {
  return Boolean(line.buyerId && line.batchId && line.productId && Number(line.weight) > 0 && Number(line.rate) > 0);
}

function isFloorLineValid(line: StockLineDraft): boolean {
  return Boolean(
    line.buyerId &&
      line.sellerId &&
      line.batchId &&
      line.productId &&
      Number(line.weight) > 0 &&
      Number(line.rate) > 0
  );
}

function getStockBatchOption(options: StockBatchOption[], batchId: string): StockBatchOption | undefined {
  return options.find((option) => option.value === batchId);
}

function getProfileInitials(profile: StaffProfile): string {
  return profile.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function areDesktopRoutesEqual(left: DesktopRouteState, right: DesktopRouteState): boolean {
  return (
    left.view === right.view &&
    left.customerLedgerUserId === right.customerLedgerUserId &&
    left.customerLedgerBillId === right.customerLedgerBillId &&
    left.sellerLedgerUserId === right.sellerLedgerUserId
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallbackValue);
      }
    }, timeoutMs);

    void promise
      .then((value) => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timer);
          resolve(value);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timer);
          resolve(fallbackValue);
        }
      });
  });
}

function viewNeedsSaleLookups(view: ViewKey): boolean {
  return view === "auction" || view === "direct" || view === "batch" || view === "floor";
}

const LOOKUPS_LOAD_TIMEOUT_MS = 10_000;

function getSafeDesktopLandingView(): ViewKey {
  const preferred = getLandingView();
  return viewNeedsSaleLookups(preferred) ? "hub" : preferred;
}

function App(): ReactElement {
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lookups, setLookups] = useState<SaleFormLookups | null>(null);
  const [view, setView] = useState<ViewKey>("hub");
  const [selectedCustomerLedgerUserId, setSelectedCustomerLedgerUserId] = useState<string | null>(null);
  const [selectedCustomerLedgerBillId, setSelectedCustomerLedgerBillId] = useState<string | null>(null);
  const [selectedSellerLedgerUserId, setSelectedSellerLedgerUserId] = useState<string | null>(null);
  const [routeHistory, setRouteHistory] = useState<DesktopRouteState[]>([]);
  const [routeHistoryIndex, setRouteHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "success" | "warning"; text: string } | null>(null);
  const [localSecurity, setLocalSecurity] = useState<DesktopLocalSecuritySnapshot>(() => getDesktopLocalSecuritySnapshot());
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);
  const [isSecurityLocked, setIsSecurityLocked] = useState(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const routeStateRef = useRef<DesktopRouteState>({
    view: "hub",
    customerLedgerUserId: null,
    customerLedgerBillId: null,
    sellerLedgerUserId: null,
  });
  const routeHistoryRef = useRef<DesktopRouteState[]>([]);
  const routeHistoryIndexRef = useRef(-1);

  const applyRouteState = (route: DesktopRouteState) => {
    setView(route.view);
    setSelectedCustomerLedgerUserId(route.customerLedgerUserId);
    setSelectedCustomerLedgerBillId(route.customerLedgerBillId);
    setSelectedSellerLedgerUserId(route.sellerLedgerUserId);
  };

  const initializeRouteHistory = (route: DesktopRouteState) => {
    routeHistoryRef.current = [route];
    routeHistoryIndexRef.current = 0;
    setRouteHistory([route]);
    setRouteHistoryIndex(0);
    applyRouteState(route);
  };

  const navigateToRoute = (route: DesktopRouteState) => {
    const currentRoute = routeStateRef.current;
    if (areDesktopRoutesEqual(currentRoute, route)) {
      setMessage(null);
      return;
    }

    const baseHistory =
      routeHistoryIndexRef.current >= 0
        ? routeHistoryRef.current.slice(0, routeHistoryIndexRef.current + 1)
        : [currentRoute];
    const lastBaseRoute = baseHistory[baseHistory.length - 1];
    const nextHistory =
      lastBaseRoute && areDesktopRoutesEqual(lastBaseRoute, route)
        ? baseHistory
        : [...baseHistory, route];
    const nextIndex = nextHistory.length - 1;

    routeHistoryRef.current = nextHistory;
    routeHistoryIndexRef.current = nextIndex;
    setRouteHistory(nextHistory);
    setRouteHistoryIndex(nextIndex);
    applyRouteState(route);
    setMessage(null);
  };

  const navigateToView = (nextView: ViewKey) => {
    navigateToRoute({
      view: nextView,
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: selectedCustomerLedgerBillId,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const handleGoBack = () => {
    if (routeHistoryIndexRef.current <= 0) {
      return;
    }

    const nextIndex = routeHistoryIndexRef.current - 1;
    const nextRoute = routeHistoryRef.current[nextIndex];
    if (!nextRoute) {
      return;
    }

    routeHistoryIndexRef.current = nextIndex;
    setRouteHistoryIndex(nextIndex);
    applyRouteState(nextRoute);
    setMessage(null);
  };

  const handleGoForward = () => {
    if (routeHistoryIndexRef.current >= routeHistoryRef.current.length - 1) {
      return;
    }

    const nextIndex = routeHistoryIndexRef.current + 1;
    const nextRoute = routeHistoryRef.current[nextIndex];
    if (!nextRoute) {
      return;
    }

    routeHistoryIndexRef.current = nextIndex;
    setRouteHistoryIndex(nextIndex);
    applyRouteState(nextRoute);
    setMessage(null);
  };

  useEffect(() => {
    routeStateRef.current = {
      view,
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: selectedCustomerLedgerBillId,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    };
  }, [selectedCustomerLedgerBillId, selectedCustomerLedgerUserId, selectedSellerLedgerUserId, view]);

  useEffect(() => {
    void (async () => {
      const securitySnapshot = getDesktopLocalSecuritySnapshot();
      setLocalSecurity(securitySnapshot);

      try {
        const currentProfile = await withTimeout(
          window.managerDesktopApi.auth.getState(),
          4000,
          null
        );
        setProfile(currentProfile);

        setAuthReady(true);

        void window.managerDesktopApi.sync
          .getStatus()
          .then(setSyncStatus)
          .catch(() => {
            setSyncStatus({
              connected: false,
              connecting: false,
              hasSynced: false,
              lastSyncedAt: null,
              lastError: null,
            });
          });

        if (currentProfile) {
          initializeRouteHistory({
            view: getSafeDesktopLandingView(),
            customerLedgerUserId: null,
            customerLedgerBillId: null,
            sellerLedgerUserId: null,
          });
          if (securitySnapshot.enabled) {
            setIsSecurityLocked(true);
          } else {
            setShowSecuritySetup(true);
          }

          void loadLookups();
        }
      } catch (error) {
        setMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "Could not initialize the desktop app.",
        });
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const interval = window.setInterval(() => {
      void window.managerDesktopApi.sync.getStatus().then(setSyncStatus).catch(() => {});
    }, 6000);

    return () => window.clearInterval(interval);
  }, [profile]);

  useEffect(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (!profile || !localSecurity.enabled || showSecuritySetup || isSecurityLocked) {
      return;
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        setIsSecurityLocked(true);
      }, localSecurity.timeoutSeconds * 1000);
    };

    const activityHandler = () => {
      resetTimer();
    };

    resetTimer();

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "wheel", "touchstart"];
    for (const eventName of events) {
      window.addEventListener(eventName, activityHandler, { passive: true });
    }

    return () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      for (const eventName of events) {
        window.removeEventListener(eventName, activityHandler);
      }
    };
  }, [isSecurityLocked, localSecurity.enabled, localSecurity.timeoutSeconds, profile, showSecuritySetup]);

  const loadLookups = async (): Promise<SaleFormLookups | null> => {
    setLookupsLoading(true);
    setLookupsError(null);

    try {
      const saleLookups = await Promise.race<SaleFormLookups>([
        window.managerDesktopApi.sales.getLookups(),
        new Promise<SaleFormLookups>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error("Loading sale lookups from PowerSync timed out."));
          }, LOOKUPS_LOAD_TIMEOUT_MS);
        }),
      ]);
      setLookups(saleLookups);
      return saleLookups;
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : "Could not load sale lookups from PowerSync.";
      setLookupsError(nextError);
      return null;
    } finally {
      setLookupsLoading(false);
    }
  };

  const handleRefresh = async ({ silent = false }: { silent?: boolean } = {}) => {
    setRefreshing(true);
    if (!silent) {
      setMessage(null);
    }

    try {
      const [status] = await Promise.all([
        window.managerDesktopApi.sync.refresh(),
        loadLookups(),
      ]);
      setSyncStatus(status);
      if (!silent) {
        setMessage({ tone: "success", text: "PowerSync data refreshed." });
      }
    } catch (error) {
      if (!silent) {
        setMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "Could not refresh PowerSync data.",
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleHostedLogin = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const nextProfile = await window.managerDesktopApi.auth.loginWithAuthHub();
      const securitySnapshot = getDesktopLocalSecuritySnapshot();
      setProfile(nextProfile);
      setLocalSecurity(securitySnapshot);
      initializeRouteHistory({
        view: getSafeDesktopLandingView(),
        customerLedgerUserId: null,
        customerLedgerBillId: null,
        sellerLedgerUserId: null,
      });
      setIsSecurityLocked(false);
      setShowSecuritySetup(!securitySnapshot.enabled);
      setMessage({ tone: "success", text: "Signed in and synchronized." });

      void withTimeout(window.managerDesktopApi.sync.getStatus(), 8000, {
        connected: false,
        connecting: false,
        hasSynced: false,
        lastSyncedAt: null,
        lastError: null,
      }).then(setSyncStatus);
      void loadLookups();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Hosted sign in failed.",
      });
    } finally {
      setBusy(false);
      setAuthReady(true);
    }
  };

  const handlePasswordReset = async () => {
    setBusy(true);
    setMessage(null);

    try {
      await window.managerDesktopApi.auth.openPasswordReset();
      setMessage({
        tone: "success",
        text: "Password reset opened in your browser.",
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not open password reset.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setMessage(null);

    try {
      await window.managerDesktopApi.auth.logout();
      setProfile(null);
      setSyncStatus({
        connected: false,
        connecting: false,
        hasSynced: false,
        lastSyncedAt: null,
        lastError: null,
      });
      setLookups(null);
      setSelectedCustomerLedgerUserId(null);
      setSelectedCustomerLedgerBillId(null);
      setSelectedSellerLedgerUserId(null);
      setLocalSecurity(getDesktopLocalSecuritySnapshot());
      setShowSecuritySetup(false);
      setIsSecurityLocked(false);
      routeHistoryRef.current = [];
      routeHistoryIndexRef.current = -1;
      setRouteHistory([]);
      setRouteHistoryIndex(-1);
      setView("hub");
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not log out.",
      });
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) {
    return (
      <div className="loading-wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="spinner" />
          <div>Loading desktop manager...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <LoginScreen
        busy={busy}
        message={message}
        onHostedLogin={handleHostedLogin}
        onPasswordReset={handlePasswordReset}
      />
    );
  }

  if (showSecuritySetup) {
    return (
      <DesktopLocalSecuritySetup
        onComplete={(snapshot) => {
          setLocalSecurity(snapshot);
          setShowSecuritySetup(false);
          setIsSecurityLocked(false);
          setMessage({ tone: "success", text: "Local unlock enabled for this device." });
        }}
        onLogout={handleLogout}
        profile={profile}
      />
    );
  }

  if (isSecurityLocked && localSecurity.enabled) {
    return (
      <DesktopLocalSecurityLock
        onLogout={handleLogout}
        onUnlock={() => {
          setIsSecurityLocked(false);
          setMessage(null);
        }}
        snapshot={localSecurity}
      />
    );
  }

  const openCustomerLedgerDetail = (userId: string) => {
    navigateToRoute({
      view: "ledgers-customers-detail",
      customerLedgerUserId: userId,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openCustomerLedgerHistory = (userId: string) => {
    navigateToRoute({
      view: "ledgers-customers-history",
      customerLedgerUserId: userId,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openCustomerLedgerBill = (userId: string, billId: string) => {
    navigateToRoute({
      view: "ledgers-customers-bill",
      customerLedgerUserId: userId,
      customerLedgerBillId: billId,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openSellerLedgerHistory = (userId: string) => {
    navigateToRoute({
      view: "ledgers-sellers-history",
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: selectedCustomerLedgerBillId,
      sellerLedgerUserId: userId,
    });
  };

  const openLedgerOverview = () => {
    navigateToRoute({
      view: "ledgers-overview",
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openCustomerLedgerDay = () => {
    navigateToRoute({
      view: "ledgers-customers-day",
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openCustomerLedgerDetailSearch = () => {
    navigateToRoute({
      view: "ledgers-customers-detail",
      customerLedgerUserId: null,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openCustomerLedgerHistorySearch = () => {
    navigateToRoute({
      view: "ledgers-customers-history",
      customerLedgerUserId: null,
      customerLedgerBillId: null,
      sellerLedgerUserId: selectedSellerLedgerUserId,
    });
  };

  const openSellerLedgerDay = () => {
    navigateToRoute({
      view: "ledgers-sellers-day",
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: selectedCustomerLedgerBillId,
      sellerLedgerUserId: null,
    });
  };

  const openSellerLedgerHistorySearch = () => {
    navigateToRoute({
      view: "ledgers-sellers-history",
      customerLedgerUserId: selectedCustomerLedgerUserId,
      customerLedgerBillId: selectedCustomerLedgerBillId,
      sellerLedgerUserId: null,
    });
  };

  const handleDesktopNav = (href: string, label: string) => {
    const targetView = desktopViewByHref[href];

    if (!targetView) {
      setMessage({
        tone: "warning",
        text: `${label} is not added in the desktop app yet. Sales entry is ready first.`,
      });
      return;
    }

    switch (targetView) {
      case "ledgers-overview":
        openLedgerOverview();
        return;
      case "ledgers-customers-day":
        openCustomerLedgerDay();
        return;
      case "ledgers-customers-detail":
        openCustomerLedgerDetailSearch();
        return;
      case "ledgers-customers-history":
        openCustomerLedgerHistorySearch();
        return;
      case "ledgers-sellers-day":
        openSellerLedgerDay();
        return;
      case "ledgers-sellers-history":
        openSellerLedgerHistorySearch();
        return;
      default:
        navigateToView(targetView);
    }
  };

  return (
    <DesktopShell
      profile={profile}
      view={view}
      syncStatus={syncStatus}
      refreshing={refreshing}
      busy={busy}
      message={message}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      onDesktopNav={handleDesktopNav}
      canGoBack={routeHistoryIndex > 0}
      canGoForward={routeHistoryIndex >= 0 && routeHistoryIndex < routeHistory.length - 1}
      onGoBack={handleGoBack}
      onGoForward={handleGoForward}
    >
      {viewNeedsSaleLookups(view) && !lookups ? (
        <div className="content-card">
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {lookupsLoading ? <div className="spinner" /> : null}
              <div>
                {lookupsLoading
                  ? "Loading sale lookups from PowerSync..."
                  : lookupsError ?? "Sale lookups are unavailable right now."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="secondary-button"
                type="button"
                disabled={lookupsLoading}
                onClick={() => {
                  void loadLookups();
                }}
              >
                Retry Loading Lookups
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigateToView("settings")}
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      ) : view === "hub" ? (
        <SalesHub syncStatus={syncStatus} onNavigate={navigateToView} />
      ) : view === "ledgers-overview" ? (
        <DesktopLedgersOverviewPage
          onNavigate={(target) => {
            switch (target) {
              case "ledgers-overview":
                openLedgerOverview();
                break;
              case "ledgers-customers-day":
                openCustomerLedgerDay();
                break;
              case "ledgers-customers-detail":
                openCustomerLedgerDetailSearch();
                break;
              case "ledgers-customers-history":
                openCustomerLedgerHistorySearch();
                break;
              case "ledgers-sellers-day":
                openSellerLedgerDay();
                break;
              case "ledgers-sellers-history":
                openSellerLedgerHistorySearch();
                break;
              default:
                navigateToView(target);
            }
          }}
        />
      ) : view === "ledgers-customers-day" ? (
        <DesktopCustomerDayLedgerPage onMessage={setMessage} onOpenDetail={openCustomerLedgerDetail} />
      ) : view === "ledgers-customers-detail" ? (
        <DesktopCustomerLedgerDetailPage
          onOpenBill={openCustomerLedgerBill}
          onOpenHistory={openCustomerLedgerHistory}
          onSelectUser={openCustomerLedgerDetail}
          userId={selectedCustomerLedgerUserId}
        />
      ) : view === "ledgers-customers-history" ? (
        <DesktopCustomerLedgerHistoryPage
          onOpenDetail={openCustomerLedgerDetail}
          onSelectUser={openCustomerLedgerHistory}
          userId={selectedCustomerLedgerUserId}
        />
      ) : view === "ledgers-customers-bill" ? (
        <DesktopCustomerBillPage
          billId={selectedCustomerLedgerBillId}
          onBackToDetail={openCustomerLedgerDetail}
          onSelectUser={openCustomerLedgerDetail}
          userId={selectedCustomerLedgerUserId}
        />
      ) : view === "ledgers-sellers-day" ? (
        <DesktopSellerDayLedgerPage onOpenHistory={openSellerLedgerHistory} />
      ) : view === "ledgers-sellers-history" ? (
        <DesktopSellerLedgerHistoryPage
          onSelectUser={openSellerLedgerHistory}
          userId={selectedSellerLedgerUserId}
        />
      ) : view === "operations" ? (
        <DesktopOperationsOverviewPage onNavigate={navigateToView} />
      ) : view === "due-collection" ? (
        <DesktopDueCollectionPage onMessage={setMessage} />
      ) : view === "chalans" ? (
        <DesktopDailyChalansPage onMessage={setMessage} />
      ) : view === "buyer-purchases" ? (
        <DesktopBuyerPurchasesPage onMessage={setMessage} />
      ) : view === "verification" ? (
        <DesktopChalanVerificationPage />
      ) : view === "payments" ? (
        <DesktopPaymentsPage key="payments" initialSegment="customer" onMessage={setMessage} />
      ) : view === "spendings" ? (
        <DesktopPaymentsPage key="spendings" initialSegment="spendings" onMessage={setMessage} />
      ) : view === "quotes" ? (
        <DesktopQuotesPage onDataChanged={() => handleRefresh({ silent: true })} onMessage={setMessage} />
      ) : view === "users" ? (
        <DesktopUsersPage onDataChanged={() => handleRefresh({ silent: true })} onMessage={setMessage} />
      ) : view === "products" ? (
        <DesktopProductsPage onDataChanged={() => handleRefresh({ silent: true })} onMessage={setMessage} />
      ) : view === "stock" ? (
        <DesktopStockPage onDataChanged={() => handleRefresh({ silent: true })} onMessage={setMessage} />
      ) : view === "settings" ? (
        <DesktopSettingsPage
          onLock={() => setIsSecurityLocked(true)}
          onLogout={handleLogout}
          onRefresh={() => handleRefresh()}
          onSecurityChanged={(snapshot) => {
            setLocalSecurity(snapshot);
            if (!snapshot.enabled) {
              setShowSecuritySetup(false);
              setIsSecurityLocked(false);
            }
          }}
          profile={profile}
          securitySnapshot={localSecurity}
          syncStatus={syncStatus}
        />
      ) : view === "auction" ? (
        <AuctionSalePage
          lookups={lookups!}
          onDone={async () => {
            await handleRefresh({ silent: true });
          }}
          onBack={() => navigateToView("hub")}
          onMessage={setMessage}
        />
      ) : view === "direct" ? (
        <DirectSalePage
          lookups={lookups!}
          onDone={async () => {
            await handleRefresh({ silent: true });
          }}
          onBack={() => navigateToView("hub")}
          onMessage={setMessage}
        />
      ) : view === "batch" ? (
        <BatchSalePage
          lookups={lookups!}
          onDone={async () => {
            await handleRefresh({ silent: true });
          }}
          onBack={() => navigateToView("hub")}
          onMessage={setMessage}
        />
      ) : (
        <FloorSalePage
          lookups={lookups!}
          onDone={async () => {
            await handleRefresh({ silent: true });
          }}
          onBack={() => navigateToView("hub")}
          onMessage={setMessage}
        />
      )}
    </DesktopShell>
  );
}

function LoginScreen({
  busy,
  message,
  onHostedLogin,
  onPasswordReset,
}: {
  busy: boolean;
  message: { tone: "error" | "success" | "warning"; text: string } | null;
  onHostedLogin: () => Promise<void>;
  onPasswordReset: () => Promise<void>;
}): ReactElement {
  return (
    <div className="login-layout">
      <div
        className="login-card"
      >
        <div className="login-header">
          <div className="brand-mark" style={{ width: 72, height: 72, borderRadius: 24 }}>
            MFC
          </div>
          <div className="brand-title" style={{ fontSize: "2rem" }}>
            Manager
          </div>
          <div className="page-subtitle">Secure sign in for the desktop manager</div>
        </div>

        {message ? <div className={`banner ${message.tone}`}>{message.text}</div> : null}

        <div className="login-actions">
          <button className="primary-button" type="button" disabled={busy} onClick={() => void onHostedLogin()}>
            {busy ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span className="inline-spinner" />
                Opening secure sign in...
              </span>
            ) : (
              "Continue to Secure Sign In"
            )}
          </button>
          <button className="secondary-button" type="button" disabled={busy} onClick={() => void onPasswordReset()}>
            Reset Password
          </button>
          <div className="login-divider">Manager access only</div>
        </div>
      </div>
    </div>
  );
}

function DesktopShell({
  profile,
  view,
  syncStatus,
  refreshing,
  busy,
  message,
  onRefresh,
  onLogout,
  onDesktopNav,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  children,
}: {
  profile: StaffProfile;
  view: ViewKey;
  syncStatus: SyncStatus | null;
  refreshing: boolean;
  busy: boolean;
  message: { tone: "error" | "success" | "warning"; text: string } | null;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  onDesktopNav: (href: string, label: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  children: ReactElement;
}): ReactElement {
  const syncTone = syncStatus?.connected ? "success" : syncStatus?.lastError ? "danger" : "warning";
  const currentHref = desktopViewHrefByKey[view];
  const currentNavItem = managerDesktopNavigationGroups
    .flatMap((group) => group.items)
    .reduce<(typeof managerDesktopNavigationGroups)[number]["items"][number] | undefined>((best, item) => {
      const bestScore = best ? getDesktopNavItemScore(best, currentHref) : -1;
      const itemScore = getDesktopNavItemScore(item, currentHref);
      return itemScore > bestScore ? item : best;
    }, undefined);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-eyebrow">MFC Manager</div>
          <div className="sidebar-brand-title">Operations Desk</div>
        </div>

        <nav className="sidebar-nav">
          {managerDesktopNavigationGroups.map((group) => (
            <section key={group.title} className="sidebar-nav-group">
              <div className="sidebar-nav-label">{group.title}</div>
              <div className="sidebar-nav-list">
                {group.items.map((item) => {
                  const Icon = desktopNavIconsByHref[item.href] ?? LayoutDashboard;
                  const available = Boolean(desktopViewByHref[item.href]);
                  const active = currentNavItem?.href === item.href;

                  return (
                    <button
                      key={item.key}
                      className={cn(
                        "sidebar-nav-link",
                        active && "active",
                        !available && "disabled"
                      )}
                      onClick={() => onDesktopNav(item.href, item.label)}
                      type="button"
                    >
                      <Icon className="sidebar-nav-icon" size={16} />
                      <span className="sidebar-nav-text">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-account">
            <div className="avatar-circle">{getProfileInitials(profile)}</div>
            <div className="sidebar-account-copy">
              <div className="sidebar-account-name">{profile.display_name}</div>
              <div className="sidebar-account-role">manager</div>
            </div>
          </div>
          <div className="sidebar-footer-meta">
            <span>{syncStatus?.connected ? "PowerSync live" : "PowerSync waiting"}</span>
            <span>
              {syncStatus?.lastSyncedAt
                ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString("en-IN")
                : "No local pull yet"}
            </span>
          </div>
          <div className="sidebar-footer-actions">
            <button className="secondary-button" onClick={() => void onRefresh()} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button className="ghost-button" onClick={() => void onLogout()} disabled={busy}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <LogOut size={15} />
                Log out
              </span>
            </button>
          </div>
        </div>
      </aside>

      <main className="shell-main">
        <header className="topbar">
          <div>
            <div className="tile-eyebrow">Manager desktop</div>
            <div className="topbar-title">{currentNavItem?.label ?? "Sales Hub"}</div>
          </div>
          <div className="topbar-actions">
            <div className="desktop-history-actions">
              <button
                aria-label="Go back"
                className="secondary-button topbar-icon-button"
                disabled={!canGoBack}
                onClick={onGoBack}
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Go forward"
                className="secondary-button topbar-icon-button"
                disabled={!canGoForward}
                onClick={onGoForward}
                type="button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="status-pill">
              <span className={`status-dot ${syncTone}`} />
              <span>
                {syncStatus?.connecting
                  ? "Connecting"
                  : syncStatus?.connected
                    ? "PowerSync connected"
                    : syncStatus?.lastError
                      ? "Sync error"
                      : "Sync pending"}
              </span>
            </div>
            <button className="secondary-button" onClick={() => void onRefresh()} disabled={refreshing}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={16} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </header>

        <div className="page-wrap">
          <div className="page-panel">
            {message ? <div className={`banner ${message.tone}`}>{message.text}</div> : null}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function SalesHub({
  syncStatus,
  onNavigate,
}: {
  syncStatus: SyncStatus | null;
  onNavigate: (view: ViewKey) => void;
}): ReactElement {
  const cards = managerSaleFlowDefinitions.map((flow) => ({
    view: flow.desktopView,
    title: flow.hubTitle,
    copy: flow.hubDescription,
    tone: flow.hubMeta,
    icon: saleHubIconByFlow[flow.key],
  }));

  return (
    <div className="content-grid">
      <div className="content-card">
        <div className="page-header">
          <div>
            <div className="tile-eyebrow">Desktop manager</div>
            <h1 className="page-title">Sales Hub</h1>
            <p className="page-subtitle">
              PowerSync keeps the desktop read model local. Sale creation still writes directly to Supabase.
            </p>
          </div>
        </div>

        <div className="sales-grid" style={{ marginTop: 18 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button key={card.view} className="tile" onClick={() => onNavigate(card.view)}>
                <div className="tile-icon">
                  <Icon size={20} />
                </div>
                <div className="tile-eyebrow">{card.tone}</div>
                <div className="tile-title">{card.title}</div>
                <div className="tile-copy">{card.copy}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="status-card">
        <div>
          <div className="tile-eyebrow">Current sync</div>
          <div className="card-title" style={{ fontSize: "1.2rem", marginTop: 8 }}>
            {syncStatus?.connected ? "PowerSync connected" : "Waiting for sync"}
          </div>
          <div className="status-meta" style={{ marginTop: 8, lineHeight: 1.6 }}>
            {syncStatus?.lastSyncedAt
              ? `Last synced ${new Date(syncStatus.lastSyncedAt).toLocaleString("en-IN")}`
              : "No completed sync yet."}
          </div>
        </div>
        {syncStatus?.lastError ? (
          <div className="banner error">{syncStatus.lastError}</div>
        ) : (
          <div className="info-note">
            Login, PowerSync sync, and sale entry are wired. Operations, payments, and ledgers can be added on the
            same desktop shell next.
          </div>
        )}
      </div>
    </div>
  );
}

function AuctionSalePage({
  lookups,
  onDone,
  onBack: _onBack,
  onMessage,
}: {
  lookups: SaleFormLookups;
  onDone: () => Promise<void>;
  onBack: () => void;
  onMessage: (message: { tone: "error" | "success" | "warning"; text: string } | null) => void;
}): ReactElement {
  const [sellerId, setSellerId] = useState("");
  const [saleDate, setSaleDate] = useState(getCurrentDateIST());
  const [commissionPercentage, setCommissionPercentage] = useState("6");
  const [paidAmount, setPaidAmount] = useState("");
  const [items, setItems] = useState<AuctionLineDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const buyerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const productRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const weightRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusLineId = useRef<string | null>(null);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );
  const commissionRate = Number(commissionPercentage || 0);
  const roundedNetAmount = Math.floor((totalAmount - (totalAmount * commissionRate) / 100) / 5) * 5;
  const adjustedCommission = totalAmount - roundedNetAmount;
  const paidAmountValue = Number(paidAmount || 0);
  const balanceAfterPayment = Math.max(roundedNetAmount - paidAmountValue, 0);

  useEffect(() => {
    if (!pendingFocusLineId.current) {
      return;
    }

    focusInputElement(buyerRefs.current[pendingFocusLineId.current]);
    pendingFocusLineId.current = null;
  }, [items]);

  const addLine = (afterId?: string, prefill = "") => {
    setItems((current) => {
      const nextLine = { ...createAuctionLine(), productDescription: prefill };
      pendingFocusLineId.current = nextLine.id;

      if (!afterId) {
        return [...current, nextLine];
      }

      const nextItems = [...current];
      const currentIndex = nextItems.findIndex((line) => line.id === afterId);
      if (currentIndex === -1) {
        nextItems.push(nextLine);
        return nextItems;
      }

      nextItems.splice(currentIndex + 1, 0, nextLine);
      return nextItems;
    });
  };

  const updateLine = (lineId: string, patch: Partial<AuctionLineDraft>) => {
    setItems((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const removeLine = (lineId: string) => {
    setItems((current) => current.filter((line) => line.id !== lineId));
  };

  const assignRef = (
    type: "buyer" | "product" | "weight" | "rate",
    lineId: string,
    element: HTMLInputElement | null
  ) => {
    const registry = {
      buyer: buyerRefs,
      product: productRefs,
      weight: weightRefs,
      rate: rateRefs,
    }[type];

    if (element) {
      registry.current[lineId] = element;
    } else {
      delete registry.current[lineId];
    }
  };

  const handleBuyerEnter = (lineId: string) => focusInputElement(productRefs.current[lineId]);
  const handleProductEnter = (lineId: string) => focusInputElement(weightRefs.current[lineId]);
  const handleWeightEnter = (lineId: string) => focusInputElement(rateRefs.current[lineId]);
  const handleRateEnter = (lineId: string) => {
    const currentLine = items.find((item) => item.id === lineId);
    if (currentLine && isAuctionLineValid(currentLine)) {
      addLine(lineId, currentLine.productDescription);
    }
  };

  const resetForm = () => {
    setSellerId("");
    setSaleDate(getCurrentDateIST());
    setCommissionPercentage("6");
    setPaidAmount("");
    setItems([]);
  };

  const submit = async () => {
    if (!sellerId) {
      onMessage({ tone: "error", text: "Select the seller for this auction sale." });
      return;
    }

    const saleItems = items
      .filter(isAuctionLineValid)
      .map(
        (item): Parameters<typeof window.managerDesktopApi.sales.createAuction>[0]["items"][number] => ({
          buyer_id: item.buyerId,
          product_description: item.productDescription.trim(),
          weight: Number(item.weight),
          rate: Number(item.rate),
        })
      );

    if (!saleItems.length) {
      onMessage({ tone: "error", text: "Add at least one valid auction line." });
      return;
    }

    setSubmitting(true);
    onMessage(null);

    try {
      await window.managerDesktopApi.sales.createAuction({
        sellerId,
        commissionPercentage: Number(commissionPercentage || 0),
        paidAmount: paidAmount ? Number(paidAmount) : undefined,
        saleDate,
        items: saleItems,
      });
      await onDone();
      resetForm();
      onMessage({
        tone: "success",
        text: `Auction Sale Created • Amount Payable: ${formatCurrency(roundedNetAmount)}`,
      });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create auction sale.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SalePageContainer title={getManagerSaleFlowDefinition("auction").entryTitle} date={saleDate}>
      <div className="sale-form-panel">
        <section className="sale-section">
          <div className="sale-field-wrap">
            <AutocompleteInput
              label="Seller Name *"
              placeholder="Search and select seller..."
              options={lookups.auctionSellers}
              selectedId={sellerId}
              onSelect={(option) => setSellerId(option.value)}
              disabled={submitting}
            />
          </div>
        </section>

        <section className="sale-section">
          <SaleSectionHeader
            title={`Sale Items (${items.length})`}
            subtitle="Buyer, product, weight, rate"
            action={
              items.length > 0 ? (
                <button className="secondary-button sale-mini-action" onClick={() => addLine()} disabled={submitting}>
                  <Plus className="sale-button-icon" size={16} />
                  Add Item
                </button>
              ) : null
            }
          />

          {items.length === 0 ? (
            <SaleEmptyState
              text="No items have been added to this sale yet."
              actionLabel="Add First Item"
              onAction={() => addLine()}
              disabled={submitting}
            />
          ) : (
            <div className="sale-row-stack">
              {items.map((item, index) => (
                <AuctionSaleRow
                  key={item.id}
                  item={item}
                  index={index}
                  buyerOptions={lookups.buyers}
                  onUpdate={updateLine}
                  onRemove={removeLine}
                  onAddBelow={(afterId, prefillProduct) => addLine(afterId, prefillProduct)}
                  onBuyerEnter={handleBuyerEnter}
                  onProductEnter={handleProductEnter}
                  onWeightEnter={handleWeightEnter}
                  onRateEnter={handleRateEnter}
                  assignRef={assignRef}
                  disabled={submitting}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          )}
        </section>

        <section className="sale-section sale-section-divider">
          <SaleSectionHeader title="Summary" subtitle="Commission and payment" />
          <div className="field-grid">
            <TextField
              label="Commission %"
              type="number"
              value={commissionPercentage}
              onChange={setCommissionPercentage}
              disabled={submitting}
            />
            <TextField
              label="Paid amount"
              type="number"
              value={paidAmount}
              onChange={setPaidAmount}
              disabled={submitting}
            />
          </div>
          <div className="summary-row">
            <span>Gross amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <div className="summary-row">
            <span>Commission ({commissionRate}%)</span>
            <strong className="danger-text">- {formatCurrency(adjustedCommission)}</strong>
          </div>
          <div className="summary-row">
            <span>Amount payable</span>
            <strong>{formatCurrency(roundedNetAmount)}</strong>
          </div>
          <div className="summary-row">
            <span>Balance after payment</span>
            <strong className="success-text">{formatCurrency(balanceAfterPayment)}</strong>
          </div>
        </section>

        <SaleFormActions
          submitting={submitting}
          submitLabel="Save Chalan"
          onSubmit={() => void submit()}
          onCancel={resetForm}
        />

        {items.length > 0 ? (
          <section className="sale-section sale-section-divider">
            <SaleSectionHeader title="Items Preview" subtitle="Live auction lines" />
            <div className="sale-preview-table">
              <div className="sale-preview-head">
                <span>#</span>
                <span>Product</span>
                <span>Buyer</span>
                <span>Weight</span>
                <span>Rate</span>
                <span>Total</span>
              </div>
              {items.map((item, index) => {
                const rawBuyer = getSelectedLabel(lookups.buyers, item.buyerId) || "Pending";
                const buyerLabel = rawBuyer.includes("(") ? rawBuyer.split("(")[0]?.trim() || rawBuyer : rawBuyer;
                const amount = Number(item.weight || 0) * Number(item.rate || 0);
                return (
                  <div className="sale-preview-row" key={item.id}>
                    <span>{index + 1}</span>
                    <span>{item.productDescription || "Pending"}</span>
                    <span>{buyerLabel}</span>
                    <span>{Number(item.weight || 0).toFixed(2)}</span>
                    <span>{Number(item.rate || 0).toFixed(2)}</span>
                    <strong>{formatCurrency(amount)}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </SalePageContainer>
  );
}

function DirectSalePage({
  lookups,
  onDone,
  onBack: _onBack,
  onMessage,
}: {
  lookups: SaleFormLookups;
  onDone: () => Promise<void>;
  onBack: () => void;
  onMessage: (message: { tone: "error" | "success" | "warning"; text: string } | null) => void;
}): ReactElement {
  const [saleDate, setSaleDate] = useState(getCurrentDateIST());
  const [buyerId, setBuyerId] = useState("");
  const [items, setItems] = useState<StockLineDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const sellerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const productRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const weightRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusLineId = useRef<string | null>(null);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );

  useEffect(() => {
    if (!pendingFocusLineId.current) {
      return;
    }

    focusInputElement(sellerRefs.current[pendingFocusLineId.current]);
    pendingFocusLineId.current = null;
  }, [items]);

  const addLine = (afterId?: string) => {
    setItems((current) => {
      const nextLine = createStockLine();
      pendingFocusLineId.current = nextLine.id;

      if (!afterId) {
        return [...current, nextLine];
      }

      const nextItems = [...current];
      const currentIndex = nextItems.findIndex((line) => line.id === afterId);
      if (currentIndex === -1) {
        nextItems.push(nextLine);
        return nextItems;
      }

      nextItems.splice(currentIndex + 1, 0, nextLine);
      return nextItems;
    });
  };

  const updateLine = (lineId: string, patch: Partial<StockLineDraft>) => {
    setItems((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const removeLine = (lineId: string) => {
    setItems((current) => current.filter((line) => line.id !== lineId));
  };

  const assignRef = (
    type: "seller" | "product" | "weight" | "rate",
    lineId: string,
    element: HTMLInputElement | null
  ) => {
    const registry = {
      seller: sellerRefs,
      product: productRefs,
      weight: weightRefs,
      rate: rateRefs,
    }[type];

    if (element) {
      registry.current[lineId] = element;
    } else {
      delete registry.current[lineId];
    }
  };

  const handleSellerEnter = (lineId: string) => focusInputElement(productRefs.current[lineId]);
  const handleProductEnter = (lineId: string) => focusInputElement(weightRefs.current[lineId]);
  const handleWeightEnter = (lineId: string) => focusInputElement(rateRefs.current[lineId]);
  const handleRateEnter = (lineId: string) => {
    const currentLine = items.find((item) => item.id === lineId);
    if (currentLine && isDirectLineValid(currentLine)) {
      addLine(lineId);
    }
  };

  const resetForm = () => {
    setSaleDate(getCurrentDateIST());
    setBuyerId("");
    setItems([]);
  };

  const submit = async () => {
    if (!buyerId) {
      onMessage({ tone: "error", text: "Select the buyer for this direct sale." });
      return;
    }

    const saleItems: DirectSaleItemInput[] = items
      .filter(isDirectLineValid)
      .map((item) => ({
        stock_batch_id: item.batchId,
        product_id: item.productId,
        weight: Number(item.weight),
        rate: Number(item.rate),
        mfc_seller_id: item.sellerId,
      }));

    if (!saleItems.length) {
      onMessage({ tone: "error", text: "Add at least one valid stock line." });
      return;
    }

    setSubmitting(true);
    onMessage(null);

    try {
      const billNumber = await window.managerDesktopApi.sales.createDirect({
        buyerId,
        saleDate,
        items: saleItems,
      });
      await onDone();
      resetForm();
      onMessage({ tone: "success", text: `Bill ${billNumber} saved successfully.` });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create direct sale.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SalePageContainer title={getManagerSaleFlowDefinition("direct").entryTitle} date={saleDate}>
      <div className="sale-form-panel">
        <section className="sale-section">
          <div className="sale-field-wrap">
            <AutocompleteInput
              label="Buyer Name *"
              placeholder="Search and select buyer..."
              options={lookups.buyers}
              selectedId={buyerId}
              onSelect={(option) => setBuyerId(option.value)}
              disabled={submitting}
            />
          </div>
        </section>

        <section className="sale-section">
          <SaleSectionHeader
            title={`Sale Items (${items.length})`}
            subtitle="Seller, stock batch, weight, rate"
            action={
              items.length > 0 ? (
                <button className="secondary-button sale-mini-action" onClick={() => addLine()} disabled={submitting}>
                  <Plus className="sale-button-icon" size={16} />
                  Add Item
                </button>
              ) : null
            }
          />

          {items.length === 0 ? (
            <SaleEmptyState
              text="No items have been added to this sale yet."
              actionLabel="Add First Item"
              onAction={() => addLine()}
              disabled={submitting}
            />
          ) : (
            <div className="sale-row-stack">
              {items.map((item, index) => {
                const batchOptions = item.sellerId
                  ? lookups.stockBatches.filter((option) => !option.mfcSellerId || option.mfcSellerId === item.sellerId)
                  : lookups.stockBatches;

                return (
                  <DirectSaleRow
                    key={item.id}
                    item={item}
                    index={index}
                    sellerOptions={lookups.mfcSellers}
                    batchOptions={batchOptions}
                    onUpdate={updateLine}
                    onRemove={removeLine}
                    onAddBelow={(afterId) => addLine(afterId)}
                    onSellerEnter={handleSellerEnter}
                    onProductEnter={handleProductEnter}
                    onWeightEnter={handleWeightEnter}
                    onRateEnter={handleRateEnter}
                    assignRef={assignRef}
                    disabled={submitting}
                    autoFocus={index === 0}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="sale-section sale-section-divider">
          <SaleSectionHeader title="Total Amount" subtitle="Live total from the current line items." />
          <div className="summary-row">
            <span>Total amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
        </section>

        <SaleFormActions
          submitting={submitting}
          submitLabel="Save Sale"
          onSubmit={() => void submit()}
          onCancel={resetForm}
        />
      </div>
    </SalePageContainer>
  );
}

function BatchSalePage({
  lookups,
  onDone,
  onBack: _onBack,
  onMessage,
}: {
  lookups: SaleFormLookups;
  onDone: () => Promise<void>;
  onBack: () => void;
  onMessage: (message: { tone: "error" | "success" | "warning"; text: string } | null) => void;
}): ReactElement {
  const [saleDate, setSaleDate] = useState(getCurrentDateIST());
  const [sellerId, setSellerId] = useState("");
  const [items, setItems] = useState<StockLineDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const buyerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const productRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const weightRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusLineId = useRef<string | null>(null);

  const batchOptions = sellerId
    ? lookups.stockBatches.filter((option) => !option.mfcSellerId || option.mfcSellerId === sellerId)
    : lookups.stockBatches;

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );

  useEffect(() => {
    if (!pendingFocusLineId.current) {
      return;
    }

    focusInputElement(buyerRefs.current[pendingFocusLineId.current]);
    pendingFocusLineId.current = null;
  }, [items]);

  const addLine = (afterId?: string) => {
    setItems((current) => {
      const nextLine = createStockLine();
      pendingFocusLineId.current = nextLine.id;

      if (!afterId) {
        return [...current, nextLine];
      }

      const nextItems = [...current];
      const currentIndex = nextItems.findIndex((line) => line.id === afterId);
      if (currentIndex === -1) {
        nextItems.push(nextLine);
        return nextItems;
      }

      nextItems.splice(currentIndex + 1, 0, nextLine);
      return nextItems;
    });
  };

  const updateLine = (lineId: string, patch: Partial<StockLineDraft>) => {
    setItems((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const removeLine = (lineId: string) => {
    setItems((current) => current.filter((line) => line.id !== lineId));
  };

  const assignRef = (
    type: "buyer" | "product" | "weight" | "rate",
    lineId: string,
    element: HTMLInputElement | null
  ) => {
    const registry = {
      buyer: buyerRefs,
      product: productRefs,
      weight: weightRefs,
      rate: rateRefs,
    }[type];

    if (element) {
      registry.current[lineId] = element;
    } else {
      delete registry.current[lineId];
    }
  };

  const handleBuyerEnter = (lineId: string) => focusInputElement(productRefs.current[lineId]);
  const handleProductEnter = (lineId: string) => focusInputElement(weightRefs.current[lineId]);
  const handleWeightEnter = (lineId: string) => focusInputElement(rateRefs.current[lineId]);
  const handleRateEnter = (lineId: string) => {
    const currentLine = items.find((item) => item.id === lineId);
    if (currentLine && isBatchLineValid(currentLine)) {
      addLine(lineId);
    }
  };

  const resetForm = () => {
    setSaleDate(getCurrentDateIST());
    setSellerId("");
    setItems([]);
  };

  const submit = async () => {
    if (!sellerId) {
      onMessage({ tone: "error", text: "Select the MFC seller for this batch sale." });
      return;
    }

    const saleItems: BatchSaleItemInput[] = items
      .filter(isBatchLineValid)
      .map((item) => ({
        buyer_id: item.buyerId,
        stock_batch_id: item.batchId,
        product_id: item.productId,
        weight: Number(item.weight),
        rate: Number(item.rate),
      }));

    if (!saleItems.length) {
      onMessage({ tone: "error", text: "Add at least one valid batch sale line." });
      return;
    }

    setSubmitting(true);
    onMessage(null);

    try {
      const chalanNumber = await window.managerDesktopApi.sales.createBatch({
        mfcSellerId: sellerId,
        saleDate,
        items: saleItems,
      });
      await onDone();
      resetForm();
      onMessage({ tone: "success", text: `Chalan ${chalanNumber} saved successfully.` });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create batch sale.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SalePageContainer title={getManagerSaleFlowDefinition("batch").entryTitle} date={saleDate}>
      <div className="sale-form-panel">
        <section className="sale-section">
          <div className="sale-field-wrap">
            <AutocompleteInput
              label="MFC Seller *"
              placeholder="Search and select MFC seller..."
              options={lookups.mfcSellers}
              selectedId={sellerId}
              onSelect={(option) => setSellerId(option.value)}
              disabled={submitting}
            />
          </div>
        </section>

        <section className="sale-section">
          <SaleSectionHeader
            title={`Sale Items (${items.length})`}
            subtitle="Buyer, stock batch, weight, rate"
            action={
              items.length > 0 ? (
                <button className="secondary-button sale-mini-action" onClick={() => addLine()} disabled={submitting}>
                  <Plus className="sale-button-icon" size={16} />
                  Add Item
                </button>
              ) : null
            }
          />

          {items.length === 0 ? (
            <SaleEmptyState
              text="No items have been added to this sale yet."
              actionLabel="Add First Item"
              onAction={() => addLine()}
              disabled={submitting}
            />
          ) : (
            <div className="sale-row-stack">
              {items.map((item, index) => (
                <BatchSaleRow
                  key={item.id}
                  item={item}
                  index={index}
                  buyerOptions={lookups.buyers}
                  batchOptions={batchOptions}
                  onUpdate={updateLine}
                  onRemove={removeLine}
                  onAddBelow={(afterId) => addLine(afterId)}
                  onBuyerEnter={handleBuyerEnter}
                  onProductEnter={handleProductEnter}
                  onWeightEnter={handleWeightEnter}
                  onRateEnter={handleRateEnter}
                  assignRef={assignRef}
                  disabled={submitting}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          )}
        </section>

        <section className="sale-section sale-section-divider">
          <SaleSectionHeader title="Total Amount" subtitle="Live total from the current line items." />
          <div className="summary-row">
            <span>Total amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
        </section>

        <SaleFormActions
          submitting={submitting}
          submitLabel="Save Sale"
          onSubmit={() => void submit()}
          onCancel={resetForm}
        />
      </div>
    </SalePageContainer>
  );
}

function FloorSalePage({
  lookups,
  onDone,
  onBack: _onBack,
  onMessage,
}: {
  lookups: SaleFormLookups;
  onDone: () => Promise<void>;
  onBack: () => void;
  onMessage: (message: { tone: "error" | "success" | "warning"; text: string } | null) => void;
}): ReactElement {
  const [saleDate, setSaleDate] = useState(getCurrentDateIST());
  const [items, setItems] = useState<StockLineDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const sellerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const buyerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const productRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const weightRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusLineId = useRef<string | null>(null);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );

  useEffect(() => {
    if (!pendingFocusLineId.current) {
      return;
    }

    focusInputElement(sellerRefs.current[pendingFocusLineId.current]);
    pendingFocusLineId.current = null;
  }, [items]);

  const addLine = (afterId?: string) => {
    setItems((current) => {
      const nextLine = createStockLine();
      pendingFocusLineId.current = nextLine.id;

      if (!afterId) {
        return [...current, nextLine];
      }

      const nextItems = [...current];
      const currentIndex = nextItems.findIndex((line) => line.id === afterId);
      if (currentIndex === -1) {
        nextItems.push(nextLine);
        return nextItems;
      }

      nextItems.splice(currentIndex + 1, 0, nextLine);
      return nextItems;
    });
  };

  const updateLine = (lineId: string, patch: Partial<StockLineDraft>) => {
    setItems((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const removeLine = (lineId: string) => {
    setItems((current) => current.filter((line) => line.id !== lineId));
  };

  const assignRef = (
    type: "seller" | "buyer" | "product" | "weight" | "rate",
    lineId: string,
    element: HTMLInputElement | null
  ) => {
    const registry = {
      seller: sellerRefs,
      buyer: buyerRefs,
      product: productRefs,
      weight: weightRefs,
      rate: rateRefs,
    }[type];

    if (element) {
      registry.current[lineId] = element;
    } else {
      delete registry.current[lineId];
    }
  };

  const handleSellerEnter = (lineId: string) => focusInputElement(buyerRefs.current[lineId]);
  const handleBuyerEnter = (lineId: string) => focusInputElement(productRefs.current[lineId]);
  const handleProductEnter = (lineId: string) => focusInputElement(weightRefs.current[lineId]);
  const handleWeightEnter = (lineId: string) => focusInputElement(rateRefs.current[lineId]);
  const handleRateEnter = (lineId: string) => {
    const currentLine = items.find((item) => item.id === lineId);
    if (currentLine && isFloorLineValid(currentLine)) {
      addLine(lineId);
    }
  };

  const resetForm = () => {
    setSaleDate(getCurrentDateIST());
    setItems([]);
  };

  const submit = async () => {
    const saleItems: FloorSaleItemInput[] = items
      .filter(isFloorLineValid)
      .map((item) => ({
        buyer_id: item.buyerId,
        mfc_seller_id: item.sellerId,
        stock_batch_id: item.batchId,
        product_id: item.productId,
        weight: Number(item.weight),
        rate: Number(item.rate),
      }));

    if (!saleItems.length) {
      onMessage({ tone: "error", text: "Add at least one valid floor sale line." });
      return;
    }

    setSubmitting(true);
    onMessage(null);

    try {
      await window.managerDesktopApi.sales.createFloor({
        saleDate,
        items: saleItems,
      });
      await onDone();
      resetForm();
      onMessage({ tone: "success", text: "Floor sale created successfully." });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create floor sale.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SalePageContainer title={getManagerSaleFlowDefinition("floor").entryTitle} date={saleDate}>
      <div className="sale-form-panel">
        <section className="sale-section">
          <SaleSectionHeader
            title={`Sale Items (${items.length})`}
            subtitle="Seller, buyer, stock batch, weight, rate"
            action={
              items.length > 0 ? (
                <button className="secondary-button sale-mini-action" onClick={() => addLine()} disabled={submitting}>
                  <Plus className="sale-button-icon" size={16} />
                  Add Item
                </button>
              ) : null
            }
          />

          {items.length === 0 ? (
            <SaleEmptyState
              text="No items have been added to this sale yet."
              actionLabel="Add First Item"
              onAction={() => addLine()}
              disabled={submitting}
            />
          ) : (
            <div className="sale-row-stack">
              {items.map((item, index) => {
                const batchOptions = item.sellerId
                  ? lookups.stockBatches.filter((option) => !option.mfcSellerId || option.mfcSellerId === item.sellerId)
                  : lookups.stockBatches;

                return (
                  <FloorSaleRow
                    key={item.id}
                    item={item}
                    index={index}
                    sellerOptions={lookups.mfcSellers}
                    buyerOptions={lookups.buyers}
                    batchOptions={batchOptions}
                    onUpdate={updateLine}
                    onRemove={removeLine}
                    onAddBelow={(afterId) => addLine(afterId)}
                    onSellerEnter={handleSellerEnter}
                    onBuyerEnter={handleBuyerEnter}
                    onProductEnter={handleProductEnter}
                    onWeightEnter={handleWeightEnter}
                    onRateEnter={handleRateEnter}
                    assignRef={assignRef}
                    disabled={submitting}
                    autoFocus={index === 0}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="sale-section sale-section-divider">
          <SaleSectionHeader title="Total Amount" subtitle="Live total from the current line items." />
          <div className="summary-row">
            <span>Total amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
        </section>

        <SaleFormActions
          submitting={submitting}
          submitLabel="Save Sale"
          onSubmit={() => void submit()}
          onCancel={resetForm}
        />
      </div>
    </SalePageContainer>
  );
}

function SalePageContainer({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="sale-page-shell">
      <div className="sale-page-intro">
        <h1 className="sale-page-title">{title}</h1>
        <div className="sale-page-date">Date: {new Date(date).toLocaleDateString("en-IN")}</div>
      </div>
      {children}
    </div>
  );
}

function SaleSectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}): ReactElement {
  return (
    <div className="sale-section-header">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <div className="sale-section-action">{action}</div> : null}
    </div>
  );
}

function SaleEmptyState({
  text,
  actionLabel,
  onAction,
  disabled,
}: {
  text: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}): ReactElement {
  return (
    <div className="sale-empty-state">
      <p>{text}</p>
      <button className="secondary-button sale-mini-action" onClick={onAction} disabled={disabled}>
        <Plus className="sale-button-icon" size={16} />
        {actionLabel}
      </button>
    </div>
  );
}

function SaleFormActions({
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}): ReactElement {
  return (
    <div className="sale-form-actions">
      <button className="primary-button sale-submit-button" onClick={onSubmit} disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="sale-button-icon spin" size={16} />
            Saving...
          </>
        ) : (
          <>
            <Save className="sale-button-icon" size={16} />
            {submitLabel}
          </>
        )}
      </button>
      <button className="secondary-button sale-cancel-button" onClick={onCancel} disabled={submitting}>
        Cancel
      </button>
    </div>
  );
}

function SaleLineRail({
  index,
  onAddBelow,
  disabled,
}: {
  index: number;
  onAddBelow: () => void;
  disabled?: boolean;
}): ReactElement {
  return (
    <div className="sale-line-rail">
      <div className="sale-line-badge">{index + 1}</div>
      <button className="sale-line-icon-button" onClick={onAddBelow} disabled={disabled} title="Add item below">
        <PlusCircle size={16} />
      </button>
    </div>
  );
}

function SaleComputedAmount({ amount }: { amount: number }): ReactElement {
  return (
    <div className="sale-computed-value" title={formatCurrency(amount)}>
      {formatCurrency(amount)}
    </div>
  );
}

function AuctionSaleRow({
  item,
  index,
  buyerOptions,
  onUpdate,
  onRemove,
  onAddBelow,
  onBuyerEnter,
  onProductEnter,
  onWeightEnter,
  onRateEnter,
  assignRef,
  disabled,
  autoFocus,
}: {
  item: AuctionLineDraft;
  index: number;
  buyerOptions: SelectionOption[];
  onUpdate: (lineId: string, patch: Partial<AuctionLineDraft>) => void;
  onRemove: (lineId: string) => void;
  onAddBelow: (lineId: string, prefillProduct: string) => void;
  onBuyerEnter: (lineId: string) => void;
  onProductEnter: (lineId: string) => void;
  onWeightEnter: (lineId: string) => void;
  onRateEnter: (lineId: string) => void;
  assignRef: (type: "buyer" | "product" | "weight" | "rate", lineId: string, element: HTMLInputElement | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}): ReactElement {
  const amount = Number(item.weight || 0) * Number(item.rate || 0);

  return (
    <div className="sale-line-card">
      <SaleLineRail index={index} onAddBelow={() => onAddBelow(item.id, item.productDescription)} disabled={disabled} />
      <div className="sale-line-body">
        <div className="sale-line-top">
          <div className="sale-line-flex-3">
            <AutocompleteInput
              label="Buyer"
              placeholder="Select buyer..."
              options={buyerOptions}
              selectedId={item.buyerId}
              onSelect={(option) => onUpdate(item.id, { buyerId: option.value })}
              onEnterKey={() => onBuyerEnter(item.id)}
              inputRef={(element) => assignRef("buyer", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
              autoFocus={autoFocus}
            />
          </div>
          <div className="sale-line-flex-2">
            <TextField
              label="Product description"
              placeholder="Product..."
              value={item.productDescription}
              onChange={(value) => onUpdate(item.id, { productDescription: value })}
              onEnter={() => onProductEnter(item.id)}
              inputRef={(element) => assignRef("product", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
            />
          </div>
          <button
            className="sale-line-icon-button sale-line-remove"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="sale-line-math">
          <TextField
            label="Qty"
            type="number"
            value={item.weight}
            onChange={(value) => onUpdate(item.id, { weight: value })}
            onEnter={() => onWeightEnter(item.id)}
            inputRef={(element) => assignRef("weight", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">×</span>
          <TextField
            label="Rate"
            type="number"
            value={item.rate}
            onChange={(value) => onUpdate(item.id, { rate: value })}
            onEnter={() => onRateEnter(item.id)}
            inputRef={(element) => assignRef("rate", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">=</span>
          <SaleComputedAmount amount={amount} />
        </div>
      </div>
    </div>
  );
}

function DirectSaleRow({
  item,
  index,
  sellerOptions,
  batchOptions,
  onUpdate,
  onRemove,
  onAddBelow,
  onSellerEnter,
  onProductEnter,
  onWeightEnter,
  onRateEnter,
  assignRef,
  disabled,
  autoFocus,
}: {
  item: StockLineDraft;
  index: number;
  sellerOptions: SelectionOption[];
  batchOptions: StockBatchOption[];
  onUpdate: (lineId: string, patch: Partial<StockLineDraft>) => void;
  onRemove: (lineId: string) => void;
  onAddBelow: (lineId: string) => void;
  onSellerEnter: (lineId: string) => void;
  onProductEnter: (lineId: string) => void;
  onWeightEnter: (lineId: string) => void;
  onRateEnter: (lineId: string) => void;
  assignRef: (type: "seller" | "product" | "weight" | "rate", lineId: string, element: HTMLInputElement | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}): ReactElement {
  const amount = Number(item.weight || 0) * Number(item.rate || 0);

  return (
    <div className="sale-line-card">
      <SaleLineRail index={index} onAddBelow={() => onAddBelow(item.id)} disabled={disabled} />
      <div className="sale-line-body">
        <div className="sale-line-top">
          <div className="sale-line-flex-3">
            <AutocompleteInput
              label="MFC Seller"
              placeholder="Select MFC seller..."
              options={sellerOptions}
              selectedId={item.sellerId}
              onSelect={(option) => onUpdate(item.id, { sellerId: option.value })}
              onEnterKey={() => onSellerEnter(item.id)}
              inputRef={(element) => assignRef("seller", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
              autoFocus={autoFocus}
            />
          </div>
          <div className="sale-line-flex-2">
            <AutocompleteInput
              label="Stock batch"
              placeholder="Product/Batch..."
              options={batchOptions}
              selectedId={item.batchId}
              onSelect={(option) => {
                const batch = option as StockBatchOption;
                onUpdate(item.id, {
                  batchId: batch.value,
                  productId: batch.productId,
                  sellerId: batch.mfcSellerId || item.sellerId,
                });
              }}
              onEnterKey={() => onProductEnter(item.id)}
              inputRef={(element) => assignRef("product", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
            />
          </div>
          <button
            className="sale-line-icon-button sale-line-remove"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="sale-line-math">
          <TextField
            label="Qty"
            type="number"
            value={item.weight}
            onChange={(value) => onUpdate(item.id, { weight: value })}
            onEnter={() => onWeightEnter(item.id)}
            inputRef={(element) => assignRef("weight", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">×</span>
          <TextField
            label="Rate"
            type="number"
            value={item.rate}
            onChange={(value) => onUpdate(item.id, { rate: value })}
            onEnter={() => onRateEnter(item.id)}
            inputRef={(element) => assignRef("rate", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">=</span>
          <SaleComputedAmount amount={amount} />
        </div>
      </div>
    </div>
  );
}

function BatchSaleRow({
  item,
  index,
  buyerOptions,
  batchOptions,
  onUpdate,
  onRemove,
  onAddBelow,
  onBuyerEnter,
  onProductEnter,
  onWeightEnter,
  onRateEnter,
  assignRef,
  disabled,
  autoFocus,
}: {
  item: StockLineDraft;
  index: number;
  buyerOptions: SelectionOption[];
  batchOptions: StockBatchOption[];
  onUpdate: (lineId: string, patch: Partial<StockLineDraft>) => void;
  onRemove: (lineId: string) => void;
  onAddBelow: (lineId: string) => void;
  onBuyerEnter: (lineId: string) => void;
  onProductEnter: (lineId: string) => void;
  onWeightEnter: (lineId: string) => void;
  onRateEnter: (lineId: string) => void;
  assignRef: (type: "buyer" | "product" | "weight" | "rate", lineId: string, element: HTMLInputElement | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}): ReactElement {
  const amount = Number(item.weight || 0) * Number(item.rate || 0);

  return (
    <div className="sale-line-card">
      <SaleLineRail index={index} onAddBelow={() => onAddBelow(item.id)} disabled={disabled} />
      <div className="sale-line-body">
        <div className="sale-line-top">
          <div className="sale-line-flex-3">
            <AutocompleteInput
              label="Buyer"
              placeholder="Select buyer..."
              options={buyerOptions}
              selectedId={item.buyerId}
              onSelect={(option) => onUpdate(item.id, { buyerId: option.value })}
              onEnterKey={() => onBuyerEnter(item.id)}
              inputRef={(element) => assignRef("buyer", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
              autoFocus={autoFocus}
            />
          </div>
          <div className="sale-line-flex-2">
            <AutocompleteInput
              label="Stock batch"
              placeholder="Product/Batch..."
              options={batchOptions}
              selectedId={item.batchId}
              onSelect={(option) => {
                const batch = option as StockBatchOption;
                onUpdate(item.id, {
                  batchId: batch.value,
                  productId: batch.productId,
                });
              }}
              onEnterKey={() => onProductEnter(item.id)}
              inputRef={(element) => assignRef("product", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
            />
          </div>
          <button
            className="sale-line-icon-button sale-line-remove"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="sale-line-math">
          <TextField
            label="Qty"
            type="number"
            value={item.weight}
            onChange={(value) => onUpdate(item.id, { weight: value })}
            onEnter={() => onWeightEnter(item.id)}
            inputRef={(element) => assignRef("weight", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">×</span>
          <TextField
            label="Rate"
            type="number"
            value={item.rate}
            onChange={(value) => onUpdate(item.id, { rate: value })}
            onEnter={() => onRateEnter(item.id)}
            inputRef={(element) => assignRef("rate", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">=</span>
          <SaleComputedAmount amount={amount} />
        </div>
      </div>
    </div>
  );
}

function FloorSaleRow({
  item,
  index,
  sellerOptions,
  buyerOptions,
  batchOptions,
  onUpdate,
  onRemove,
  onAddBelow,
  onSellerEnter,
  onBuyerEnter,
  onProductEnter,
  onWeightEnter,
  onRateEnter,
  assignRef,
  disabled,
  autoFocus,
}: {
  item: StockLineDraft;
  index: number;
  sellerOptions: SelectionOption[];
  buyerOptions: SelectionOption[];
  batchOptions: StockBatchOption[];
  onUpdate: (lineId: string, patch: Partial<StockLineDraft>) => void;
  onRemove: (lineId: string) => void;
  onAddBelow: (lineId: string) => void;
  onSellerEnter: (lineId: string) => void;
  onBuyerEnter: (lineId: string) => void;
  onProductEnter: (lineId: string) => void;
  onWeightEnter: (lineId: string) => void;
  onRateEnter: (lineId: string) => void;
  assignRef: (
    type: "seller" | "buyer" | "product" | "weight" | "rate",
    lineId: string,
    element: HTMLInputElement | null
  ) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}): ReactElement {
  const amount = Number(item.weight || 0) * Number(item.rate || 0);

  return (
    <div className="sale-line-card">
      <SaleLineRail index={index} onAddBelow={() => onAddBelow(item.id)} disabled={disabled} />
      <div className="sale-line-body">
        <div className="sale-line-top sale-line-top-split">
          <div className="sale-line-flex-1">
            <AutocompleteInput
              label="MFC Seller"
              placeholder="MFC Seller..."
              options={sellerOptions}
              selectedId={item.sellerId}
              onSelect={(option) => onUpdate(item.id, { sellerId: option.value })}
              onEnterKey={() => onSellerEnter(item.id)}
              inputRef={(element) => assignRef("seller", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
              autoFocus={autoFocus}
            />
          </div>
          <div className="sale-line-flex-1">
            <AutocompleteInput
              label="Buyer"
              placeholder="Buyer..."
              options={buyerOptions}
              selectedId={item.buyerId}
              onSelect={(option) => onUpdate(item.id, { buyerId: option.value })}
              onEnterKey={() => onBuyerEnter(item.id)}
              inputRef={(element) => assignRef("buyer", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
            />
          </div>
        </div>

        <div className="sale-line-top">
          <div className="sale-line-flex-3">
            <AutocompleteInput
              label="Stock batch"
              placeholder="Product/Batch..."
              options={batchOptions}
              selectedId={item.batchId}
              onSelect={(option) => {
                const batch = option as StockBatchOption;
                onUpdate(item.id, {
                  batchId: batch.value,
                  productId: batch.productId,
                  sellerId: batch.mfcSellerId || item.sellerId,
                });
              }}
              onEnterKey={() => onProductEnter(item.id)}
              inputRef={(element) => assignRef("product", item.id, element)}
              compact
              hideLabel
              disabled={disabled}
            />
          </div>
          <button
            className="sale-line-icon-button sale-line-remove"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="sale-line-math">
          <TextField
            label="Qty"
            type="number"
            value={item.weight}
            onChange={(value) => onUpdate(item.id, { weight: value })}
            onEnter={() => onWeightEnter(item.id)}
            inputRef={(element) => assignRef("weight", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">×</span>
          <TextField
            label="Rate"
            type="number"
            value={item.rate}
            onChange={(value) => onUpdate(item.id, { rate: value })}
            onEnter={() => onRateEnter(item.id)}
            inputRef={(element) => assignRef("rate", item.id, element)}
            compact
            hideLabel
            disabled={disabled}
          />
          <span className="sale-line-operator">=</span>
          <SaleComputedAmount amount={amount} />
        </div>
      </div>
    </div>
  );
}

function AutocompleteInput({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
  onEnterKey,
  inputRef,
  autoFocus = false,
  compact = false,
  hideLabel = false,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: SelectionOption[];
  selectedId: string;
  onSelect: (option: SelectionOption) => void;
  onEnterKey?: () => void;
  inputRef?: (element: HTMLInputElement | null) => void;
  autoFocus?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
  disabled?: boolean;
}): ReactElement {
  const selected = options.find((option) => option.value === selectedId) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurTimeoutRef = useRef<number | null>(null);
  const optionRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected?.label]);

  const filtered = useMemo(() => filterOptions(options, query), [options, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const commitSelection = (option: SelectionOption, moveNext = false) => {
    setQuery(option.label);
    setOpen(false);
    onSelect(option);
    if (moveNext) {
      window.setTimeout(() => onEnterKey?.(), 0);
    }
  };

  return (
    <div className={`field-block autocomplete ${compact ? "compact" : ""}`}>
      <label className={hideLabel ? "sr-only" : "field-label"}>{label}</label>
      <div className="field-input-wrap">
        <input
          ref={(element) => inputRef?.(element)}
          className={`text-input ${compact ? "compact" : ""}`}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => {
              setOpen(false);
              setQuery(selected?.label ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter") {
              if (open && filtered[activeIndex]) {
                event.preventDefault();
                commitSelection(filtered[activeIndex]!, true);
              } else if (selected && onEnterKey) {
                event.preventDefault();
                onEnterKey();
              }
            } else if (event.key === "Escape") {
              setOpen(false);
              setQuery(selected?.label ?? "");
            }
          }}
        />
        {query ? (
          <button
            className="input-clear-button"
            onMouseDown={(event) => {
              event.preventDefault();
              setQuery("");
              setOpen(true);
            }}
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>
      {open && filtered.length > 0 ? (
        <div className="autocomplete-panel">
          {filtered.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              className={`autocomplete-option ${index === activeIndex ? "active" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                if (blurTimeoutRef.current) {
                  window.clearTimeout(blurTimeoutRef.current);
                }
                commitSelection(option);
              }}
            >
              <span>{option.label}</span>
              {option.description || option.meta ? (
                <span className="autocomplete-meta">{option.description ?? option.meta}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  onEnter,
  inputRef,
  autoFocus = false,
  compact = false,
  hideLabel = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "number";
  onEnter?: () => void;
  inputRef?: (element: HTMLInputElement | null) => void;
  autoFocus?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}): ReactElement {
  return (
    <div className={`field-block ${compact ? "compact" : ""}`}>
      <label className={hideLabel ? "sr-only" : "field-label"}>{label}</label>
      <input
        ref={(element) => inputRef?.(element)}
        className={`text-input ${compact ? "compact" : ""}`}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onEnter?.();
          }
        }}
      />
    </div>
  );
}

export default App;
