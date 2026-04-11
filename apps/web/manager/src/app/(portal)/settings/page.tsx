"use client";

import { LocalAuthSettings } from "@/components/auth/LocalAuthSettings";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DEFAULT_LANDING,
    LANDING_OPTIONS,
    getLandingPreference,
    setLandingPreference,
} from "@/lib/landing-preference";
import { useRealtimeSync } from "@mfc/realtime-sync/react";
import { formatDistanceToNow } from "date-fns";
import {
    AlertCircle,
    CheckCircle2,
    Lock,
    RefreshCw,
    Wifi,
    WifiOff
} from "lucide-react";
import { useEffect, useState } from "react";


export default function SettingsPage() {
    const { isOnline, lastSyncTime, isSyncing, syncError, syncNow } = useRealtimeSync();
    const [landingPage, setLandingPageState] = useState(DEFAULT_LANDING);

    useEffect(() => {
        setLandingPageState(getLandingPreference());
    }, []);

    return (
        <div className="container mx-auto max-w-4xl space-y-8 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your application preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Choose where the manager app should open after login.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="max-w-sm space-y-2">
                        <div className="text-sm font-medium">Default landing page</div>
                        <Select
                            value={landingPage}
                            onValueChange={(value) => {
                                setLandingPreference(value);
                                setLandingPageState(value);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select landing page" />
                            </SelectTrigger>
                            <SelectContent>
                                {LANDING_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Default is Customer Ledger Day. You can change it anytime here.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Sync Status */}
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Sync Status</h2>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                        {isOnline ? "Online" : "Offline"}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
                        <div className="space-y-1">
                            <div className="font-medium">Last Sync</div>
                            <div className="text-sm text-muted-foreground">
                                {lastSyncTime
                                    ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
                                    : "Never synced"}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncNow()}
                            disabled={isSyncing || !isOnline}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "Syncing..." : "Sync Now"}
                        </Button>
                    </div>

                    {syncError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200 text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{syncError}</span>
                        </div>
                    )}

                    {!syncError && lastSyncTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Your data is synchronized with the server</span>
                        </div>
                    )}
                </div>
            </div>



            {/* Security Settings (Popup) */}
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Security</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your PIN and biometric authentication
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Manage Security
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Security Settings</DialogTitle>
                                <DialogDescription>
                                    Configure your local authentication preferences.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <LocalAuthSettings />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

        </div>
    );
}
