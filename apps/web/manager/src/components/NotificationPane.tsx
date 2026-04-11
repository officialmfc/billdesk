"use client";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogEntry, useLogStore } from "@/lib/log-store";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Trash2 } from "lucide-react";
import { useState } from "react";

export function NotificationPane(): React.JSX.Element {
  const { logs, unreadCount, clearLogs, markAllRead } = useLogStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      markAllRead();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          title="System Notifications"
        >
          <Info className="h-4 w-4" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">System Logs</h4>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Info className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                System events and info logs will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors text-sm flex gap-3 items-start",
                    log.level === 'error' && "bg-red-50/50 dark:bg-red-950/10",
                    log.level === 'warn' && "bg-yellow-50/50 dark:bg-yellow-950/10"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {getLogIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-xs text-muted-foreground">
                        {log.level.toUpperCase()}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 break-words">{log.message}</p>
                    {log.data && (
                      <pre className="mt-2 text-[10px] bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
