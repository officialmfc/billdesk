"use client";

/**
 * Reusable Realtime Notification Badge
 * Can be used in any app in the monorepo
 */

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface RealtimeEvent {
  id: string;
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  timestamp: string;
  recordId?: string;
}

const TABLE_NAMES: Record<string, string> = {
  users: "Users",
  products: "Products",
  stock_batches: "Stock",
  daily_bills: "Bills",
  sale_transactions: "Sales",
  chalans: "Chalans",
  quotes: "Quotes",
  customer_payments: "Payments",
  seller_payments: "Payouts",
  approvals: "Approvals",
  ledgers: "Ledgers",
  mfc_staff: "Staff",
};

interface RealtimeNotificationBadgeProps {
  maxEvents?: number;
  tableNames?: Record<string, string>;
  className?: string;
}

export function RealtimeNotificationBadge({
  maxEvents = 20,
  tableNames = TABLE_NAMES,
  className = "",
}: RealtimeNotificationBadgeProps): React.JSX.Element {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("🎧 RealtimeNotificationBadge: Setting up listeners");

    // Listen for realtime events
    const handleRealtimeEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("📨 RealtimeNotificationBadge: Received event", customEvent.detail);
      
      const { table, eventType, recordId } = customEvent.detail;

      const newEvent: RealtimeEvent = {
        id: `${Date.now()}-${Math.random()}`,
        table,
        eventType,
        timestamp: new Date().toISOString(),
        recordId,
      };

      console.log("➕ Adding event to list:", newEvent);
      setEvents((prev) => {
        const updated = [newEvent, ...prev.slice(0, maxEvents - 1)];
        console.log("📋 Updated events list:", updated.length, "events");
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    };

    const handleConnectionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const connected = customEvent.detail?.connected ?? false;
      console.log("🔌 Connection status changed:", connected);
      setIsConnected(connected);
    };

    // Register listeners
    window.addEventListener("mfc:realtime:change", handleRealtimeEvent);
    window.addEventListener("mfc:realtime:connection", handleConnectionChange);

    // Check initial connection
    setIsConnected(navigator.onLine);
    console.log("✅ Listeners registered");

    return () => {
      console.log("🧹 Cleaning up listeners");
      window.removeEventListener("mfc:realtime:change", handleRealtimeEvent);
      window.removeEventListener("mfc:realtime:connection", handleConnectionChange);
    };
  }, [maxEvents]);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setEvents([]);
    setUnreadCount(0);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "text-green-600";
      case "UPDATE":
        return "text-blue-600";
      case "DELETE":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTableDisplayName = (table: string) => {
    return tableNames[table] || table;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
        title="Realtime updates"
      >
        <Bell className="h-4 w-4" />
        {/* Connection status dot */}
        <div
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
              <span className="font-semibold text-sm">Realtime Updates</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>

            {/* Events list */}
            <div className="max-h-[350px] overflow-y-auto">
              {events.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-2">📡</div>
                  <p className="text-sm text-gray-500">No recent updates</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Changes will appear here in real-time
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        event.eventType === "INSERT"
                          ? "bg-green-500"
                          : event.eventType === "UPDATE"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {getTableDisplayName(event.table)}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${getEventColor(
                            event.eventType
                          )} border-current`}
                        >
                          {event.eventType}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {events.length > 0 && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
